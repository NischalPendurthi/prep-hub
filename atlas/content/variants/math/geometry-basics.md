---
id: geometry-basics
title: Cross Product & Orientation
signals:
  - "is point C left of, right of, or on the line AB"
  - "do two segments intersect / touch"
  - "polygon area, point inside a polygon, convex hull"
  - "integer coordinates up to 1e9 and the answer must be exact"
idea: |
  `cross(a, b) = a.x·b.y − a.y·b.x`. `cross(B−A, C−A)` is **> 0 if C is left** of A→B
  (counter-clockwise), < 0 if right, 0 if collinear, and its absolute value is twice the
  triangle's area. Everything else builds on this **orientation** test: segments cross when
  each one's endpoints lie on **opposite sides** of the other, polygon area is the
  **shoelace** sum of `cross(p_i, p_{i+1}) / 2`, and a point is inside a polygon when a ray
  from it crosses the boundary an odd number of times. Stay in **integers**, never floats.
complexity: "O(1) per test, O(n) for area / point in polygon, O(n log n) hull"
pitfalls:
  - "Coordinates up to 1e9: differences up to 2e9, products up to 4e18, fits ll but 2 more bits don't; use __int128 beyond that."
  - "Segment intersection: when all four orientations are 0 (collinear), check bounding boxes overlap."
  - "Shoelace gives a signed area; take abs, and 2·area is the integer to print if the answer is x.5."
  - "Using doubles and == for collinearity."
  - "Point in polygon: check 'on the boundary' first, then do the ray test."
related: [convex-hull-trick, sweep-line-events, two-pointers-opposite]
---
### Core
```cpp
ll cross(P a,P b){return a.x*b.y-a.y*b.x;}
ll orient(P a,P b,P c){ ll v=cross(b-a,c-a); return (v>0)-(v<0); }
```

### Built from orientation

| question | test |
|---|---|
| C left / right / on line AB | sign of `orient(A,B,C)` |
| C on segment AB | `orient == 0` and `min(A.x,B.x) ≤ C.x ≤ max(...)`, same for y |
| segments AB and CD intersect | `o1=orient(A,B,C), o2=orient(A,B,D), o3=orient(C,D,A), o4=orient(C,D,B)`; `o1·o2 ≤ 0 && o3·o4 ≤ 0`, collinear case: bounding boxes overlap |
| polygon area | `abs(Σ cross(p[i], p[i+1])) / 2` |
| point in polygon | boundary check, then count edges with `(a.y ≤ p.y) != (b.y ≤ p.y)` that pass to the right |
| convex hull | sort points, keep turns with `orient > 0` (monotone chain) |

### Spotting it
Any "left/right/turn/inside/area" wording with integer points. If the input is integer, the
answer usually can be too: compare cross products instead of angles or slopes.
