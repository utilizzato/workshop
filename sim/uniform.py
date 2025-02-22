import numpy as np

def weird_draw():
    x = np.random.random()
    y = np.random.random()
    z = np.random.random()
    return np.pow(x*y,z)
    
arr = [weird_draw() for _ in range(100000)]
print(np.quantile(arr, q=[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9]))
