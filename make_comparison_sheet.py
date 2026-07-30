#!/usr/bin/env python3
"""Create an SVG/HTML comparison sheet without third-party imaging dependencies."""
import argparse,html,json
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--reference',required=True);p.add_argument('--model',default='Procedural Three.js factory');p.add_argument('--reviews',required=True);p.add_argument('--out',default='comparison-sheet.html');a=p.parse_args()
r=json.loads(Path(a.reviews).read_text()); rows=''.join(f'<tr><td>{html.escape(x["pass"])}</td><td>{x["score"]:.2f}</td><td>{html.escape(x["note"])}</td></tr>' for x in r)
doc=f'''<!doctype html><title>Cyber-Bot comparison</title><style>body{{font:16px system-ui;background:#1c1720;color:#fff;padding:24px}}img{{max-width:500px;border:3px solid #ee98b9;border-radius:10px}}td,th{{padding:8px;text-align:left}}th{{color:#ff2a85}}</style><h1>Cyber-Bot vehicle — reference vs procedural build</h1><img src="{html.escape(a.reference)}" alt="reference"><h2>{html.escape(a.model)}</h2><p>Geometry is represented by <code>src/createCyberBotVehicleModel.ts</code>.</p><table><tr><th>Pass</th><th>Score</th><th>Review</th></tr>{rows}</table>'''
Path(a.out).write_text(doc); print('wrote '+a.out)
