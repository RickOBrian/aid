import sys, json
from PIL import Image, ImageChops
a = Image.open(sys.argv[1]).convert('RGB'); b = Image.open(sys.argv[2]).convert('RGB')
W, H = a.size; T = int(sys.argv[3]); CELL = int(sys.argv[4]); MINPX = int(sys.argv[5])
d = ImageChops.difference(a, b)
px = d.load()
gw, gh = (W + CELL - 1)//CELL, (H + CELL - 1)//CELL
grid = [[0]*gw for _ in range(gh)]
total = 0
for y in range(H):
    for x in range(W):
        r,g,bb = px[x,y]
        if max(r,g,bb) > T:
            grid[y//CELL][x//CELL] += 1; total += 1
on = [[grid[j][i] >= MINPX for i in range(gw)] for j in range(gh)]
seen = [[False]*gw for _ in range(gh)]; boxes = []
for j in range(gh):
    for i in range(gw):
        if on[j][i] and not seen[j][i]:
            st=[(i,j)]; seen[j][i]=True; x0=x1=i; y0=y1=j; n=0
            while st:
                ci,cj = st.pop(); n+=1; x0=min(x0,ci);x1=max(x1,ci);y0=min(y0,cj);y1=max(y1,cj)
                for di in (-1,0,1):
                    for dj in (-1,0,1):
                        ni,nj=ci+di,cj+dj
                        if 0<=ni<gw and 0<=nj<gh and on[nj][ni] and not seen[nj][ni]:
                            seen[nj][ni]=True; st.append((ni,nj))
            boxes.append([x0*CELL, y0*CELL, (x1+1)*CELL-x0*CELL, (y1+1)*CELL-y0*CELL])
print(json.dumps({"size":[W,H],"T":T,"diffPx":total,"boxes":boxes}))
