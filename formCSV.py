

import csv

with open("locations.csv", "r") as file:
    # read the csv file
    reader = csv.reader(file)
    # create a new list to store the modified rows
    modified_rows = []
    # iterate over the rows
    for row in reader:
        # add a comma to the beginning of each row
        # row.insert(0, ",")
        row[0] = "," + row[0]
        # add the modified row to the new list
        modified_rows.append(row)

with open("locations.csv", "w") as file:
    # create a csv writer
    writer = csv.writer(file)
    # write the modified rows to the new file
    writer.writerows(modified_rows)

with open('./locations.csv', "r+", encoding="utf-8") as csv_file:
    content = csv_file.read()

with open('./locations.csv', "w+", encoding="utf-8") as csv_file:
    csv_file.write(content.replace('"', ''))
