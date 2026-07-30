#!/usr/bin/env python3
"""Write a reviewed, traceable detail inventory from a JSON feature list."""
import argparse,json
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--out',default='di.json');p.add_argument('--features',required=True,help='JSON list of feature objects');a=p.parse_args()
features=json.loads(a.features)
if len(features)<16: raise SystemExit('Ultra-complex inventory requires at least 16 details')
out={'tier':'ultra-complex','detailCount':len(features),'details':features,'allMappedToGeometry':all(x.get('component') for x in features)}
Path(a.out).write_text(json.dumps(out,indent=2)+'\n');print(f"wrote {a.out}: {len(features)} details")
