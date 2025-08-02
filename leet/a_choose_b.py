def generate_all_walks_rec(n_up, n_down):
    assert n_up >= 0 and n_down >= 0
    if n_up == 0 and n_down == 0:
        return [""]
    ret = []
    if n_up > 0:
        ret += [x + "U" for x in generate_all_walks_rec(n_up - 1, n_down)]
    if n_down > 0:
        ret += [x + "D" for x in generate_all_walks_rec(n_up, n_down - 1)]
    return ret

print(generate_all_walks_rec(2,3))


def generate_all_walks_dfs(n_up, n_down):
    ret = []
    stack = [("", 0, 0)]
    while stack:
        path, cur_up, cur_down = stack.pop()
        if cur_up < n_up:
            stack.append((path + "U", cur_up + 1, cur_down))
        if cur_down < n_down:
            stack.append((path + "D", cur_up, cur_down + 1))
        if cur_up == n_up and cur_down == n_down:
            ret.append(path)
    return ret

print(generate_all_walks_dfs(2,3))