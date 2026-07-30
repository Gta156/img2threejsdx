#!/usr/bin/env python3
"""Small stdlib-only contract validator for reconstruction specs."""
import argparse,json,sys
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('spec');p.add_argument('--strict-quality',action='store_true');a=p.parse_args(); s=json.loads(Path(a.spec).read_text())
required=['name','image','domain','tier','factory','hierarchy','materials','detailInventory','passes']
missing=[x for x in required if x not in s]
errors=[] if not missing else ['missing: '+', '.join(missing)]
if s.get('factory')!='createCyberBotVehicleModel': errors.append('factory contract mismatch')
if a.strict_quality and len(s.get('detailInventory',[]))<16: errors.append('need >=16 mapped details')
if a.strict_quality and set(['blockout','structural','form','material','lighting'])-set(s.get('passes',[])): errors.append('pipeline passes incomplete')
if errors: print('\n'.join(errors),file=sys.stderr);sys.exit(1)
print('VALID: '+s['name'])
