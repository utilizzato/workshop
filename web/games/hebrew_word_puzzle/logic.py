import pygtrie
import random
import time
from dataclasses import dataclass

hebrew_words_file = "hspell_simple.txt" # https://github.com/eyaler/hebrew_wordlists/blob/main/hspell_simple.txt
test_mode = True
hebrew_letters = "אבגדהוזחטיכלמנסעפצקרשתךםןףץ"
special_no_letter = "@"
min_length = 4
deltas = [(x,y) for x in [-1,0,1] for y in [-1,0,1] if not x == y == 0]

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

def get_word_list_score(word_list):
    if test_mode:
        validate_words(word_list)
    score1 = len(word_list)
    score2 = sum(len(word) for word in word_list)
    return score1 #+ score2 # todo: better score function

@dataclass
class Board:
    size: int
    grid: dict
    words: set
    words_to_locations: dict
    starting_words_count: dict
    passing_words_count: dict

    def __init__(self, size, string=None):
        if not size in range(3,11):
            print(f"invalid size {size}")
            assert False
        if string and not len(string) == size**2:
            print(f"invalid string {string} of length {len(string)} for size {size}")
        if not string:
            string = ''.join(random.choice(hebrew_letters) for _ in range(size**2))
        self.size = size
        self.string = string
        self.grid = {(i,j) : string[j + size * i] for i in range(size) for j in range(size)}

    def validate(self):
        if not self.size in range(3,11):
            print(f"invalid size {self.size}")
            assert False
        if not set(self.grid.keys()) == {(i,j) for i in range(self.size) for j in range(self.size)}:
            print(f"invalid board {self.grid}")
            assert False
        for key in self.grid:
            val = self.grid[key]
            if not val in hebrew_letters and not val == special_no_letter:
                print(f"invalid board piece {key, val}")
                assert False

    def find_all_words(self):
        words_found = set()
        words_to_locations = {}
        for i in range(self.size):
            for j in range(self.size):
                self.find_all_words_with_starting_point((i, j), words_found, words_to_locations)

        return (words_found, words_to_locations)

    def find_all_words_with_starting_point(self, point, words_found, words_to_locations):
        covered = [point]
        last_point = point
        cur_word = self.grid[point]
        cur_locations = [point]
        self.find_all_words_with_last_point_and_cover(last_point, covered, cur_word, cur_locations, words_found, words_to_locations)

    def find_all_words_with_last_point_and_cover(self, last_point, covered, cur_word, cur_locations, words_found, words_to_locations):
        if not trie.has_node(cur_word): # not a valid word or prefix
            return
        
        if trie.has_key(cur_word) and len(cur_word) >= min_length and cur_word not in words_found:
            words_found.add(cur_word)
            words_to_locations[cur_word] = cur_locations

        for delta in deltas:
            new_point = (last_point[0] + delta[0], last_point[1] + delta[1])
            if new_point not in covered and new_point in self.grid:
                self.find_all_words_with_last_point_and_cover(new_point, covered + [new_point], cur_word + self.grid[new_point], cur_locations + [new_point], words_found, words_to_locations)

    def print(self):
        s = ""
        for i in range(self.size):
            for j in range(self.size):
                s += f"{self.grid[(i,j)]} "
            s += "\n"
        print(s)

    def do_compute(self):
        (words, words_to_locations) = self.find_all_words()
        self.words = words
        self.words_to_locations = words_to_locations

        if test_mode:
            if not words_to_locations.keys() == words:
                print(f"mismatch: words {words}, words_to_locations {words_to_locations}")
                assert False
            for word in words_to_locations:
                if not len(word) == len(words_to_locations[word]):
                    print(f"bad word {word} in locations {words_to_locations[word]}")
                    assert False

        self.starting_words_count = {(i,j) : 0 for i in range(self.size) for j in range(self.size)}
        self.passing_words_count = {(i,j) : 0 for i in range(self.size) for j in range(self.size)}
        for word in words:
            self.starting_words_count[words_to_locations[word][0]] += 1
            for cell in words_to_locations[word]:
                self.passing_words_count[cell] += 1

def generate_random_board_with_min_num_words_and_all_letters_appearing(size, min_num_words):
    count = 0
    start_time = time.time()
    while True:
        count += 1
        board = Board(size)
        board.do_compute()
        if len(board.words) >= min_num_words and min(board.passing_words_count[cell] for cell in board.grid) > 0:
            end_time = time.time()
            if test_mode:
                print(f"Runtime: {end_time - start_time:.4f} seconds, board count {count}, num words {len(board.words)}")
            return board



if __name__ == "__main__":
    board = Board(3, "אדמובבעעא")
    board.do_compute()
    print(board)
    s = [board.starting_words_count[(i,j)] for i in range(3) for j in range(3)]
    print(s)
    p = [board.passing_words_count[(i,j)] for i in range(3) for j in range(3)]
    print(p)
    #print(generate_random_board_with_min_num_words_and_all_letters_appearing(3, 50))


# def get_board_score(board, size):
#     return get_word_list_score(get_all_words(board, size))





# #temp_board = {(0, 0): 'ה', (0, 1): 'ע', (0, 2): 'ר', (0, 3): 'ך', (1, 0): 'ץ', (1, 1): 'ג', (1, 2): 'ו', (1, 3): 'ל', (2, 0): 'ש', (2, 1): 'נ', (2, 2): 'ג', (2, 3): 'ע', (3, 0): 'ז', (3, 1): 'נ', (3, 2): 'ך', (3, 3): 'א'}
# #print_board(temp_board, 4)
# #print(get_all_words(temp_board, 4))
# #print(get_board_score(temp_board, 4))

# brd = generate_random_board_with_min_score(3,20)
# print_board(brd,3)
# print(get_all_words(brd, 3))
