import numpy as np

def weird_draw():
    x = np.random.random()
    y = np.random.random()
    z = np.random.random()
    return np.pow(x*y,z)
    
arr = [weird_draw() for _ in range(100000)]
print(np.quantile(arr, q=[i/10 for i in range(1,10)]))
