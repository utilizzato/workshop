N = 421
k = 3
p = 0.5

## count APs of length k
s = 0
for a in range(N+1):
    for d in range(N+1):
        if 1 <= a and 1 <= d and a + (k-1) * d <= N:
            s += 1

## formula for APs of length k
q = (N-1) // (k-1)
r = (N-1) % (k-1)
assert 0 <= r < k-1
assert N-1 == (k-1)*q + r

f = q*(r+1) + (k-1)*q*(q-1)//2

print(f"formula = {f}, count = {s}, estimate = {int(N*N/(2*(k-1)))}")


import random
def get_rand_subset():
    return {x+1 for x in range(N) if random.random() < p}

def entire_ap_in_subset(a,d,A):
    for i in range(k):
        if a + i*d not in A:
            return False
    return True

def count_aps_in_subset(A):
    c = 0
    for a in range(N+1):
        for d in range(N+1):
            if 1 <= a and 1 <= d and a + (k-1) * d <= N and entire_ap_in_subset(a,d,A):
                c+=1
    return c

def count_aps_in_subset_alt(A):
    assert k==3
    c = 0
    for a1 in A:
        for a2 in A:
            if a2 > a1:
                a3 = 2*a2 - a1
                if a3 in A:
                    c += 1
    return c

rounds = 1000
ss = 0
if k != 3:
    for _ in range(rounds):
        A = get_rand_subset()
        ss += count_aps_in_subset(A)

if k == 3:
    for _ in range(rounds):
        A = get_rand_subset()
        ss += count_aps_in_subset_alt(A)
        
print(f"simulated avg = {ss/rounds}, formula = {(p**k)*f}")



