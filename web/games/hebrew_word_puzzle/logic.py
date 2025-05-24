import pygtrie
import random
import time
from dataclasses import dataclass
import json
from datetime import datetime, timedelta

test_mode = True
hebrew_words_file = "hspell_simple.txt" # https://github.com/eyaler/hebrew_wordlists/blob/main/hspell_simple.txt
hebrew_letters = "אבגדהוזחטיכלמנסעפצקרשתךםןףץ"
special_no_letter = "@"
min_word_length = 4
deltas = [(x,y) for x in [-1,0,1] for y in [-1,0,1] if not x == y == 0]

# creating trie
trie = pygtrie.CharTrie()
with open(hebrew_words_file, encoding="utf-8") as f:
    for line in f:
        word = line.strip()
        if word:
            trie[word] = 7 # todo: change to dictionary definition

@dataclass
class Board:
    size: int
    string: str
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
        self.do_compute()

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
        
        if trie.has_key(cur_word) and len(cur_word) >= min_word_length and cur_word not in words_found:
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

    def to_json(self, filename):
        data = {
            "size": self.size,
            "board": self.string,
            "words": list(self.words),
            "wordsToLocations": self.words_to_locations,
            "cellStartingWordCounts": [self.starting_words_count[(i,j)] for i in range(self.size) for j in range(self.size)],
            "cellPassingWordCounts": [self.passing_words_count[(i,j)] for i in range(self.size) for j in range(self.size)]
        }
        with open(filename, "w") as file:
            json.dump(data, file, indent=4, ensure_ascii=False)  # indent makes it pretty-printed

    def reach_local_maximum(self):
        update_count = 0
        cur_string = self.string
        cur_num_words = len(self.words)
        while True:
            is_local_max = True
            for idx in range(self.size**2):
                for letter in hebrew_letters:
                    if cur_string[idx] != letter:
                        new_string_list = list(cur_string)
                        new_string_list[idx] = letter
                        new_string = "".join(new_string_list)
                        new_board = Board(self.size, new_string)
                        new_num_words = len(new_board.words)
                        if new_num_words > cur_num_words:
                            cur_string = new_string
                            cur_num_words = new_num_words
                            is_local_max = False
                            update_count += 1
            if is_local_max:
                if test_mode:
                    print(f"did {update_count} updates to get local max")
                ret = Board(self.size, cur_string)
                return ret        

def generate_random_board_with_min_num_words(size, min_num_words):
    count = 0
    start_time = time.time()
    while True:
        count += 1
        board = Board(size)
        if len(board.words) >= min_num_words and min(board.passing_words_count.values()) > 0:
            end_time = time.time()
            if test_mode:
                print(f"generated {count} random boards, runtime: {end_time - start_time:.4f} seconds, num words {len(board.words)}")
            return board

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



if __name__ == "__main__":
    pass