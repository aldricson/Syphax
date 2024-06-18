import os

def generate_directory_tree_with_roles_and_files(root_dir):
    """
    Generates a directory tree starting from the root directory,
    excluding directories starting with .git and those without a role.txt file.
    Adds the content of role.txt to the folder name and lists specific files under each directory.
    If a file contains a line starting with // role:, it adds the whole file content after the file name.

    @param root_dir: Root directory to start the scan from.
    @type root_dir: str
    @return: A string representing the directory tree with role descriptions and files.
    @rtype: str
    """
    tree_structure = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude directories starting with .git
        dirnames[:] = [d for d in dirnames if not d.startswith('.git')]

        # Check if the directory contains a role.txt file
        if 'role.txt' in filenames:
            # Calculate the relative path
            relative_path = os.path.relpath(dirpath, root_dir)

            # Read the content of role.txt
            role_file_path = os.path.join(dirpath, 'role.txt')
            with open(role_file_path, 'r') as role_file:
                role_description = role_file.read().strip()

            # Append the directory and role description to the tree structure
            tree_structure.append(f"{relative_path} : {role_description}")

            # List the specific files in the directory
            for filename in filenames:
                if filename.endswith(('.js', '.jsx', '.mjs', '.css')):
                    file_relative_path = os.path.join(relative_path, filename)
                    file_content = get_file_content_if_role(os.path.join(dirpath, filename))
                    if file_content:
                        tree_structure.append(f"{file_relative_path}\n\n{file_content}\n")
                    else:
                        tree_structure.append(f"{file_relative_path}")

    return '\n'.join(tree_structure)

def get_file_content_if_role(file_path):
    """
    Reads the content of a file if it contains a line starting with // role:.
    If it does, returns the whole content. Otherwise, returns None.

    @param file_path: Path to the file to read.
    @type file_path: str
    @return: The file content or None.
    @rtype: str or None
    """
    with open(file_path, 'r') as file:
        lines = file.readlines()
        if lines and lines[0].strip().startswith("// role:"):
            return ''.join(lines)
    return None

def write_to_file(filename, content):
    """
    Writes the provided content to a file.

    @param filename: The name of the file to write to.
    @type filename: str
    @param content: The content to write to the file.
    @type content: str
    """
    with open(filename, 'w') as file:
        file.write(content)

def main():
    """
    Main function to execute the script logic.
    """
    root_directory = "/home/react/Desktop/Syphax"
    output_file = "GptKnowledge.txt"

    # Generate the directory tree with roles and files
    directory_tree_with_roles_and_files = generate_directory_tree_with_roles_and_files(root_directory)

    # Write the directory tree with roles and files to the file
    write_to_file(output_file, directory_tree_with_roles_and_files)

if __name__ == "__main__":
    main()
