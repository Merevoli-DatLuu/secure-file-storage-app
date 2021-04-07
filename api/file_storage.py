from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import logging

logging.basicConfig(filename='app.log', filemode='a', format='- %(levelname)s - %(asctime)s - %(message)s', level = logging.INFO)

"""
gauth = GoogleAuth()
# gauth.LocalWebserverAuth()
gauth.LoadCredentialsFile("mycreds.txt")
# gauth.SaveCredentialsFile("mycreds.txt")
drive = GoogleDrive(gauth)
"""


"""
API USECASE

Ref: https://github.com/nguyenhuuhai98/django-rest-framework
register    -   api/register    -   POST
login       -   api/login       -   POST

sync to server - api/files (create), api/files/<id> (modified) - POST, PUT, DELETE
	+ upload file   -   api/files       -   POST
	+ modified file -   api/files/<id>  -   PUT
	+ delete file   -   api/files/<id>  -   DELETE
sync to device - api/files - GET

"""


class FileStorage():

    def __init__(self):
        self.gauth = gauth = GoogleAuth()
        self.CREDENTIALS_FILE = "mycreds.txt"
        self.gauth.LoadCredentialsFile(self.CREDENTIALS_FILE)
        self.drive = GoogleDrive(gauth)
        logging.info('Init Server')

    def upload_file(self, file_name, file_content):
        file = self.drive.CreateFile({'title': file_name})
        file.SetContentString(file_content)
        file.Upload()
        logging.info(f'{self.upload_file.__name__} -> (file_name: {file_name}, file_content: {file_content[:50]})')

    def change_title_file(self, file, new_title):
        file['title'] = new_title 
        file.Upload()
        logging.info(f'{self.change_title_file.__name__} -> (file: {file["id"]} - {file["title"]}, new_title: {new_title})')

    def get_content_file(self, file):
        logging.info(f'{self.get_content_file.__name__} -> (file : {file["id"]} - {file["title"]})')
        return file.GetContentString()

    def change_content_file(self, file, new_content):
        file.SetContentString(new_content) 
        file.Upload() 
        logging.info(f'{self.change_content_file.__name__} -> (file: {file["id"]} - {file["title"]}, appended_content: {new_content[:50]})')

    def append_content_file(self, file, appended_content):
        content = file.GetContentString()
        file.SetContentString(content + appended_content) 
        file.Upload() 
        logging.info(f'{self.append_content_file.__name__} -> (file: {file["id"]} - {file["title"]}, appended_content: {appended_content})')

    def get_file_list(self):
        file_list = self.drive.ListFile({'q': "'root' in parents"}).GetList()
        logging.info(f'{self.get_file_list.__name__}')
        return file_list

    def get_files_by_title(self, title):
        file_list = self.drive.ListFile({'q': f"title = '{title}'"}).GetList()
        logging.info(f'{self.get_files_by_title.__name__} -> (title: {title})')
        return file_list

    def get_file_by_id(self, file_id):
        # result_file = self.drive.ListFile({'q': f"id = '{file_id}'"}).GetList()
        result_file = self.drive.CreateFile({'id': file_id})
        if (len(result_file) > 0):
            logging.info(f'{self.get_file_by_id.__name__} -> (file_id: {file_id})')
            return result_file
        else:
            logging.warning(f'{self.get_file_by_id.__name__} -> (file_id: {file_id})')
            return None

    def delete_file(self, file):
        file.Trash()
        logging.info(f'{self.delete_file.__name__} -> (file: {file["id"]} - {file["title"]})')
    
    def delete_file_by_id(self, file_id):
        file = self.get_file_by_id(file_id)
        if file is not None:
            file.Trash()
            logging.info(f'{self.delete_file_by_id.__name__} -> (file_id: {file_id})')
        else:
            logging.warning(f'{self.delete_file_by_id.__name__} -> (file_id: {file_id})')
            return None

