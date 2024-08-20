import os
import xml.etree.ElementTree as ET

def directory_to_xml(path, parent_element):
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        if os.path.isdir(item_path):
            if item == "node_modules":  # Skip the node_modules directory
                continue
            dir_element = ET.SubElement(parent_element, "directory", name=item)
            directory_to_xml(item_path, dir_element)
        else:
            ET.SubElement(parent_element, "file", name=item)

def generate_xml_structure(directory_path):
    root_element = ET.Element("directory", name=os.path.basename(directory_path))
    directory_to_xml(directory_path, root_element)
    tree = ET.ElementTree(root_element)
    return tree

if __name__ == "__main__":
    directory_path = os.getcwd()  # Replace with your directory path
    xml_tree = generate_xml_structure(directory_path)
    xml_tree.write("directory_structure.xml", encoding="utf-8", xml_declaration=True)
    print(f"Directory structure saved to directory_structure.xml")
