from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive

gauth = GoogleAuth()
# gauth.LocalWebserverAuth()
gauth.LoadCredentialsFile("mycreds.txt")
# gauth.SaveCredentialsFile("mycreds.txt")
drive = GoogleDrive(gauth)

"""

file_list = drive.ListFile({'q': 'trashed=false'}).GetList()

for file in file_list:
    print(file['title'], file['id'])

"""


file = drive.CreateFile({'title': 'My Awesome File.txt'})
file.SetContentString('Hello World!') # this writes a string directly to a file
file.Upload()