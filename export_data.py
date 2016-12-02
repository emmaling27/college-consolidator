from cs50 import SQL
import csv

def main():
    db = SQL("sqlite:///pressurecooker.db")
    
    # program below modeled after this one:https://www.getdatajoy.com/examples/python-data-analysis/read-and-write-a-csv-file-with-the-csv-module
    csv.register_dialect(
        'mydialect',
        delimiter = ',',
        quotechar = '"',
        doublequote = True,
        skipinitialspace = True,
        lineterminator = '\r\n',
        quoting = csv.QUOTE_MINIMAL)
        
    with open('Most-Recent-Cohorts-All-Data-Elements.csv', 'r') as mycsvfile:

        headers = list(csv.reader(mycsvfile, dialect='mydialect'))[0]
        column_names = ""
        for item in headers:
            column_names = column_names  + item  + " TEXT, "
        print("{}".format(column_names))
        # db.execute("CREATE TABLE college_data1 (:column_names", column_names=column_names)
        # make iterable object created from csv file
        # data = csv.reader(mycsvfile, dialect='mydialect')
        
        # # iterate over data to insert rows into college_data table
        # for row in data:
        #     newrow = ""
        #     for item in row:
        #         newrow = newrow + "'" + item + "',"
        #     db.execute("INSERT INTO college_data VALUES (:row)", row=newrow)
            
        
        # iterate over data to insert 
        print("import complete")
        mycsvfile.close()

if __name__ == "__main__":
    main()