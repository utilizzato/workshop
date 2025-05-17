import pygtrie

hebrew_words_file = "hspell_simple.txt" # https://github.com/eyaler/hebrew_wordlists/blob/main/hspell_simple.txt
test_mode = True
hebrew_letters = "אבגדהוזחטיכלמנסעפצקרשתךםןףץ"
special_no_letter = "@"
min_length = 4

# PREPROCESSING
trie = pygtrie.CharTrie()
with open(hebrew_words_file, encoding="utf-8") as f:
    for line in f:
        word = line.strip()
        if word:
            trie[word] = 7 # todo: change to dictionary definition

# Example usage
#print(sum(1 for _ in trie.items()))
#print(trie.has_key("שלום"))       # True if "שלום" is in the list
#print(trie.has_node("אבוקד"))      # non zero if any word starts with "אבוקד"
#print(trie.get("שלום"))

def validate_words(word_list):
    for word in word_list:
        if not trie.has_key(word):
            print(f"failed to validate word {word}")
            assert False

def get_score(word_list):
    if test_mode:
        validate_words(word_list)
    score1 = len(word_list)
    score2 = sum(len(word) for word in word_list)
    return score1 + score2 # todo: better score function

def validate_board(board, size):
    if not size in range(3,11):
        print(f"invalid size {size}")
        assert False
    if not set(board.keys()) == {(i,j) for i in range(size) for j in range(size)}:
        print(f"invalid board {board}")
        assert False
    for key in board:
        val = board[key]
        if not val in hebrew_letters and not val == special_no_letter:
            print(f"invalid board piece {key, board[key]}")
            assert False

test_board1 = {
    (0,0): "@",
    (0,1): "א",
    (0,2): "א",
    (1,0): "ב",
    (1,1): "ג",
    (1,2): "ת",
    (2,0): "ץ",
    (2,1): "ש",
    (2,2): "ן"
}

test_board2 = {
    (0,0): "א",
    (0,1): "ד",
    (0,2): "מ",
    (1,0): "ו",
    (1,1): "ב",
    (1,2): "ב",
    (2,0): "ע",
    (2,1): "ע",
    (2,2): "א"
}


# print(get_score(["נשמע", "רק", "מדוע"]))
# validate_board(board, 3)

def get_all_words(board, size):
    if test_mode:
        validate_board(board, size)
    ret = set()
    for i in range(size):
        for j in range(size):
            ret = ret.union(get_all_words_with_starting_point(board, (i, j)))
    return list(ret)

def get_all_words_with_starting_point(board, point):
    covered = [point]
    last_point = point
    cur_word = board[point]
    return get_all_words_with_last_point_and_cover(board, last_point, covered, cur_word)

deltas = [(x,y) for x in [-1,0,1] for y in [-1,0,1] if not x == y == 0]
#print(deltas)

def get_all_words_with_last_point_and_cover(board, last_point, covered, cur_word):
    if not trie.has_node(cur_word): # not a valid word or prefix
        return set()
    ret = set()
    if trie.has_key(cur_word) and len(cur_word) >= min_length:
        ret.add(cur_word)
    for delta in deltas:
        new_point = (last_point[0] + delta[0], last_point[1] + delta[1])
        if new_point not in covered and new_point in board:
            ret = ret.union(get_all_words_with_last_point_and_cover(board, new_point, covered + [new_point], cur_word + board[new_point]))
    return ret

print(get_all_words(test_board2, 3))