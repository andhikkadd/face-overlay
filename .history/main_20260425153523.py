import cv2
import mediapipe as mp
import numpy as np
import math
import time

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False,
                                   max_num_faces=1,
                                    refine_landmarks=True,
                                    min_detection_confidence=0.5, 
                                    min_tracking_confidence=0.5)

mp_drawing = mp.solutions.drawing_utils
mp_drawing_style = mp.solutions.drawing_styles

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    max_num_hands=2,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

pinch_prev = False
cooldown_until = 0
pinch_text_until = 0
active_idx = 0

yaw_n = 7
yaw_buffer = []
pitch_n = 8
pitch_buffer = []

pictures = [
    "assets/glasses.png",
    "assets/glasses1.png",
    "assets/glasses2.png",
    "assets/glasses3.png",
    "assets/glasses4.png",
    "assets/glasses5.png",
    "assets/glasses6.png",
    "assets/glasses7.png",
    "assets/glasses8.png",
    "assets/glasses9.png",
]

# load awal
picture_png = cv2.imread(pictures[active_idx], cv2.IMREAD_UNCHANGED)
png_h, png_w = picture_png.shape[:2]

def switch_png():
    global active_idx, picture_png, png_h, png_w

    active_idx = (active_idx + 1) % len(pictures)
    picture_png = cv2.imread(pictures[active_idx], cv2.IMREAD_UNCHANGED)
    png_h, png_w = picture_png.shape[:2]

def place_overlay(frame, overlay_rgba, x1, y1):
    H, W = frame.shape[:2]        # ambil ukuran gambar (tinggi, lebar, channel)
    h, w = overlay_rgba.shape[:2] # ambil 2 pertama (480, 640)

    x2, y2 = x1 + w, y1 + h # kotak request

    # clip to frame
    x1_clip = max(0, x1)    
    y1_clip = max(0, y1)
    x2_clip = min(W, x2)
    y2_clip = min(H, y2)

    if x1_clip >= x2_clip or y1_clip >= y2_clip:
        return  
    
    # crop overlay 
    ox1 = x1_clip - x1
    oy1 = y1_clip - y1
    ox2 = ox1 + (x2_clip - x1_clip)
    oy2 = oy1 + (y2_clip - y1_clip)

    overlay_crop = overlay_rgba[oy1:oy2, ox1:ox2]
    
    # split alpha + color
    overlay_rgb = overlay_crop[:, :, :3].astype(np.float32)
    roi = frame[y1_clip:y2_clip, x1_clip:x2_clip].astype(np.float32)
    
    #blending
    alpha = (overlay_crop[:, :, 3:4] / 255.0).astype(np.float32)  # (h,w,1)
    blended = alpha * overlay_rgb + (1.0 - alpha) * roi
    
    frame[y1_clip:y2_clip, x1_clip:x2_clip] = blended.astype(np.uint8)

def get_points(facial_landmarks, width, height):
    lm = facial_landmarks.landmark
    
    def P(i):
        return int(lm[i].x * width), int(lm[i].y * height)
    
    return {
        "nose": P(1),
        "eyeL": P(33),
        "eyeR": P(263),
        "cheekL": P(234),
        "cheekR": P(454),
        "chin": P(152),
    }

def smooth_avg(buffer, value, n):
    buffer.append(value)
    
    if len(buffer) > n:
        buffer.pop(0)
        
    return (sum(buffer)) / (len(buffer)) if buffer else 0.0

def compute_yaw_raw(pts):
    nose_x, _ = pts["nose"]
    leftc_x, _ = pts["cheekL"]
    rightc_x, _ = pts["cheekR"]
    
    # jarak yaw
    dL = nose_x - leftc_x
    dR = rightc_x - nose_x
    
    yaw_raw = dR + dL
    
    if yaw_raw == 0:
        return 0.0, dL, dR
    
    yaw_raw = (dR - dL) / yaw_raw
    
    return float(yaw_raw), dL, dR

def apply_rotate_yaw(overlay, yaw_use, strength=0.1):
    h, w = overlay.shape[:2]
    t = max(-2.0, min(1.0, yaw_use)) # limit
    dx = abs(t) * w * strength 
    dx = min(dx, w * 0.20)
    
    src = np.float32([
        [0, 0], # TL
        [w-1, 0], # TR
        [w-1, h-1], # BR
        [0, h-1] # BL
    ])
    
    tilt = dx * 0.30 #condong        
    if t > 0: # kanan
        dst = np.float32([
            [0 + dx, 0 + tilt],
            [w - 1, 0],
            [w - 1, h - 1],
            [0 + dx, h - 1 - tilt]
        ])
    else:
        dst = np.float32([
            [0, 0], 
            [w - 1 - dx, 0 + tilt], 
            [w - 1 - dx, h - 1 - tilt], 
            [0, h - 1] 
        ])
    
    M = cv2.getPerspectiveTransform(src, dst)
    warped = cv2.warpPerspective(
        overlay, M, (w, h), 
        borderValue=(0,0,0,0))    
    
    return warped, dx

def compute_roll(pts, png_h, png_w):
    (el_x, el_y) = pts["eyeL"]
    (er_x, er_y) = pts["eyeR"]
    
    # hitung jarak 2 titik mata
    eye_dist = math.hypot(er_x - el_x, er_y - el_y)
    
    # ukuran canvas png
    glasses_w = int(eye_dist * 2.01)   
    glasses_h = int(glasses_w * (png_h / png_w))
    
    # titik tengah canvas
    cx = int((el_x + er_x) / 2)
    cy = int((el_y + er_y) / 2 + 0.08 * eye_dist)
    
    # roll rotated
    angle_rad = math.atan2(er_y - el_y, er_x - el_x)
    angle_deg = -math.degrees(angle_rad)
    
    return glasses_w, glasses_h, cx, cy, eye_dist, angle_deg

def apply_rotate_roll(overlay, angle_deg):
    h, w = overlay.shape[:2]
    
    #sudut rotated 
    theta = math.radians(angle_deg)
    abs_cos = abs(math.cos(theta))
    abs_sin = abs(math.sin(theta))

    #ukuran canvas baru setelah rotate
    new_w = int(w * abs_cos + h * abs_sin)
    new_h = int(w * abs_sin + h * abs_cos)
    
    # rotation matrix
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle_deg, 1.0)
    M[0, 2] += (new_w/2) - (w/2)
    M[1, 2] += (new_h/2) - (h/2)

    rotatedroll = cv2.warpAffine(
                overlay, M, (new_w, new_h),
                flags=cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_CONSTANT,
                borderValue=(0,0,0,0))    
    
    return rotatedroll

def compute_pitch(pts):
    global pitch_buffer, pitch_n
    
    _, chin_y = pts["chin"]
    _, el_y = pts["eyeL"]
    _, er_y = pts["eyeR"]
    _, nose_y = pts["nose"]
    
    eye_cy = (er_y + el_y) / 2.0
    
    d_up = nose_y - eye_cy
    d_down = chin_y - nose_y
    
    den = d_down + d_up
    
    if den <= 1:
        pitch_raw = 0.0
    else:
        pitch_raw = (d_down - d_up) / den
        
    # pitch_raw = max(-1.0, min(1.0, pitch_raw))
    pitch = smooth_avg(pitch_buffer, pitch_raw, pitch_n)
    
    return pitch

def apply_rotate_pitch(overlay, pitch, strength=0.35):
    h, w = overlay.shape[:2]
    t = max(-2.0, min(1.0, pitch))
    dy = abs(t) * h * strength 
    dy = min(dy, h * 0.35)
    
    src = np.float32([
        [0, 0], # TL
        [w-1, 0], # TR
        [w-1, h-1], # BR
        [0, h-1] # BL
    ])
    
    tilt = dy * 0.45 #condong  
    
    if t > 0: # up
        dst = np.float32([
            [0 + tilt, 0], 
            [w - 1 - tilt, 0], 
            [w - 1 + tilt, h - 1 - dy], 
            [0 - tilt, h - 1 - dy] 
        ])
    else:
        dst = np.float32([
            [0 - tilt, 0 + dy],
            [w - 1 + tilt, 0 + dy],
            [w - 1 - tilt, h - 1],
            [0 + tilt, h - 1]
        ])
        
    M = cv2.getPerspectiveTransform(src, dst)
    warped = cv2.warpPerspective(
        overlay, M, (w, h), 
        borderValue=(0,0,0,0))
    
    return warped, dy

def process_frame(frame):
    global yaw_buffer, yaw_n, pinch_prev, cooldown_until, pinch_text_until
    height, width, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result_face = face_mesh.process(rgb)
    result_hand = hands.process(rgb)
    
    if result_hand.multi_hand_landmarks:
        hand_landmarks = result_hand.multi_hand_landmarks[0]
        # mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        lm = hand_landmarks.landmark
        now = time.time()
        
        thumb = lm[4]
        index = lm[8]
        
        thumb_px = int(thumb.x * width)
        thumb_py = int(thumb.y * height)
        
        index_px = int(index.x * width)
        index_py = int(index.y * height)
        
        cv2.circle(frame, (thumb_px, thumb_py), 2, (255,255,255), -1)
        cv2.circle(frame, (index_px, index_py), 2, (255,255,255), -1)
        
        # dist
        dx = thumb.x - index.x
        dy = thumb.y - index.y
        dist = math.sqrt(dx*dx + dy*dy)
        
        pinch = dist < 0.06
        
        if pinch and not pinch_prev and now > cooldown_until:
            switch_png()
            pinch_text_until = now + 0.3
            cooldown_until = now + 0.7
            
        # if now < pinch_text_until:
        #     cv2.putText(frame, "PINCH", (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 1)

        pinch_prev = pinch        
        # cv2.putText(frame, f"switch ke: {pictures[active_idx]}", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 1)

    if result_face.multi_face_landmarks:
        for facial_landmarks in result_face.multi_face_landmarks:
            pts = get_points(facial_landmarks, width, height)
            (nose_x, nose_y) = pts["nose"]
            (leftc_x, leftc_y) = pts["cheekL"]
            (rightc_x, rightc_y) = pts["cheekR"]
            (chin_x, chin_y) = pts["chin"]
            
            glasses_w, glasses_h, cx, cy, eye_dist, angle_deg = compute_roll(pts, png_h, png_w)
            
            yaw_raw, dL, dR = compute_yaw_raw(pts)
            yaw = smooth_avg(yaw_buffer, yaw_raw, yaw_n)
            yaw_use = yaw * 1  # sementara
            
            pitch = compute_pitch(pts)
            
            overlay = cv2.resize(picture_png, (glasses_w, glasses_h), interpolation=cv2.INTER_AREA) 
            
            yaw_warp = math.tanh(yaw_use * 1.2)
            
            overlay, dx = apply_rotate_yaw(overlay, yaw_warp, strength=0.25)
            overlay, dy = apply_rotate_pitch(overlay, pitch, strength=0.3)
            overlay = apply_rotate_roll(overlay, angle_deg)
            
            cx = int(cx - yaw_use * eye_dist * 0.1)
            
            rh, rw = overlay.shape[:2]
            x1 = cx - rw // 2
            y1 = cy - rh // 2
            place_overlay(frame, overlay, x1, y1)

            # cv2.circle(frame, (nose_x, nose_y), 4, (0,255,255), -1)
            # cv2.circle(frame, (leftc_x, leftc_y), 4, (255,0,0), -1)
            # cv2.circle(frame, (rightc_x, rightc_y), 4, (0,0,255), -1)
            # cv2.circle(frame, (chin_x, chin_y), 4, (0,0,255), -1)
            
            # cv2.line(frame, (leftc_x, leftc_y), (rightc_x, rightc_y), (255,255,0), 1)

            # cv2.putText(frame, f"pitch raw: {pitch}", (200, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 1)
            
            # cv2.rectangle(frame, (x1, y1), (x1 + rw, y1 + rh), (0, 255, 0), 2)
            
    return frame

def main():
    cap = cv2.VideoCapture()
    if not cap.isOpened():
        print("Kamera tidak kebuka.")
        exit()

    while cap.isOpened():
        ret,frame = cap.read()
        if not ret:
            print("gagal menangkap frame")
            break 
        
        frame = process_frame(cv2.flip(frame, 1))
        
        cv2.imshow("Detect", frame)
        if cv2.waitKey(1) & 0xFF ==ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
if __name__ == "__main__":
    main()