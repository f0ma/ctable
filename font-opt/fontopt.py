import glob
import re
import subprocess
import sys

def main():
    source_font_file = "MaterialIconsOutlined-Regular.otf"
    source_cp_file = "MaterialIconsOutlined-Regular.codepoints"
    output_file = "material-symbols-outlined.woff2"

    cp_dict = {}
    try:
        with open(source_cp_file, 'r') as cpf:
            for line in cpf:
                line = line.strip()
                if not line:
                    continue
                try:
                    name, code = line.split()
                    cp_dict[name] = code
                except ValueError:
                    # Skip lines that don't split into exactly two parts
                    continue
    except FileNotFoundError:
        print(f"Error: CP file not found at {source_cp_file}", file=sys.stderr)
        sys.exit(1)

    src_files = glob.glob("../src/*.jsx")
    
    used_icons = set()
    
    used_list = []
    try:
        with open("used_icons.txt", 'r') as f:
            for line in f:
                used_list.append(line.strip())
    except FileNotFoundError:
        print("Warning: used_icons.txt not found. Using an empty list for used_list.")

    for filename in src_files:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                text = f.read()
                fnd1 = re.findall(r'<span class="material-symbols-outlined" .*?>(.*?)</span>', text)
                fnd2 = re.findall(r'<span class="material-symbols-outlined-small" .*?>(.*?)</span>', text)
                
                found_icons = fnd1 + fnd2
                
                for icon in found_icons:
                    if '{' in icon:
                        continue
                    used_icons.add(icon)
        except FileNotFoundError:
            print(f"Warning: File not found: {filename}", file=sys.stderr)
        except Exception as e:
            print(f"Error processing file {filename}: {e}", file=sys.stderr)

    final_icons = list(used_list) + list(used_icons)
    
    print("Glyphs for extraction:")
    print(final_icons)

    # Ensure all collected icons have a mapping
    unicodes_list = ['5f-7a', '30-39']

    for icon in final_icons:
        if icon in cp_dict:
            unicodes_list.append(cp_dict[icon])
        else:
            print(f"Warning: Unicode code not found for icon: {icon}", file=sys.stderr)

    unicodes = ",".join(unicodes_list)

    fonttools_command = [
        "fonttools", "subset", source_font_file, 
        f"--unicodes={unicodes}", 
        "--no-layout-closure", 
        f"--output-file={output_file}",
        "--flavor=woff2"
    ]

    print("Full command:")
    print(" ".join(fonttools_command))

    try:
        subprocess.run(fonttools_command, check=True, capture_output=True, text=True)
        print("Fontsubset successful.")
    except subprocess.CalledProcessError as e:
        print(f"Error during fonttools execution: Command failed with exit code {e.returncode}", file=sys.stderr)
        print("Stdout:", e.stdout, file=sys.stderr)
        print("Stderr:", e.stderr, file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("Error: 'fonttools' command not found. Ensure fonttools is installed and in your PATH.", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
