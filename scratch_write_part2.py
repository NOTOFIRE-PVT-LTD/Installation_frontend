import sys
text = sys.stdin.read()
with open(r'F:/Installation App/Frontend/scratch_b64_part2.txt', 'w', encoding='utf-8') as f:
    f.write(text)
print(len(text))
