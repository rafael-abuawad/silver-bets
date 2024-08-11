from ape import compilers, project

source_path = project.SilverBet  # Replace with your path.
flattened_src = compilers.flatten_contract(source_path)
print(str(flattened_src))