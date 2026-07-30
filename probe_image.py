#!/usr/bin/env python3
"""Stdlib-only image metadata probe (PNG/JPEG/GIF/WebP dimensions + checksum)."""
import argparse, hashlib, json, struct
from pathlib import Path

def dimensions(data: bytes):
    if data[:8] == b'\x89PNG\r\n\x1a\n': return struct.unpack('>II', data[16:24]), 'png'
    if data[:3] == b'GIF': return struct.unpack('<HH', data[6:10]), 'gif'
    if data[:2] == b'\xff\xd8':
        i=2
        while i < len(data)-9:
            if data[i] != 0xff: i += 1; continue
            marker=data[i+1]; i += 2
            if marker in (0xd8,0xd9): continue
            n=struct.unpack('>H',data[i:i+2])[0]
            if marker in range(0xc0,0xc4):
                return struct.unpack('>HH',data[i+3:i+7])[::-1], 'jpeg'
            i += n
    raise ValueError('Unsupported or malformed image')
p=argparse.ArgumentParser(); p.add_argument('image'); p.add_argument('--out',default='probe.json'); a=p.parse_args()
b=Path(a.image).read_bytes(); (w,h),fmt=dimensions(b)
out={'path':a.image,'format':fmt,'width':w,'height':h,'aspectRatio':round(w/h,5),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
Path(a.out).write_text(json.dumps(out,indent=2)+'\n'); print(json.dumps(out,indent=2))
