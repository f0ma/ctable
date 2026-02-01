import glob
import re
import os

source_font_file="MaterialIconsOutlined-Regular.otf"
source_cp_file="MaterialIconsOutlined-Regular.codepoints"

output_file="material-symbols-outlined.woff2"

additional_icons = []

cp_dict = {}

with open(source_cp_file) as cpf:
    for line in cpf:
        name, code = line.strip().split()
        cp_dict[name] = code

src = glob.glob("../src/*.jsx")

#used in dynamic manner
used_list = ["arrow_back","subdirectory_arrow_right","add","edit","content_copy",
             "delete","refresh","search","sort","list_alt","done","select_all",
             "deselect","zoom_in","zoom_out","search","view_list","done_all"]

for filename in src:
    with open(filename) as f:
        ftext = f.read()
        fnd1 = re.findall( r'<span class="material-symbols-outlined">(.*?)</span>', ftext)
        fnd2 = re.findall( r'<span class="material-symbols-outlined-small">(.*?)</span>', ftext)
        fnd = fnd1 + fnd2
        print(filename)
        print(fnd)
        for f in fnd:
            if '{' in f: continue # skip variables
            used_list.append(f)

used_list = list(set(used_list+ additional_icons))

print("Glyphs for extraction:")
print(used_list)

unicodes = ",".join(['5f-7a','30-39'] + [cp_dict[k] for k in used_list])

cmd = f'fonttools subset {source_font_file} --unicodes={unicodes} --no-layout-closure --output-file={output_file} --flavor=woff2'

print("Full command:")
print(cmd)

os.system(cmd)
