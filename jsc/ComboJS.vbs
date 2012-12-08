'@author viktorli
'使用方法：
'放到jsc目录下，双击运行
'右键js目录，选择“ComboJS”
Dim OperationRegistry,Root,CMD,MenuName,MSG
Set OperationRegistry=WScript.CreateObject("WScript.Shell")
Root=left(wscript.scriptfullname,instrrev(wscript.scriptfullname,"\")-1)
MenuName="ComboJS"
OperationRegistry.RegWrite "HKEY_CLASSES_ROOT\Directory\shell\NodeJS\",MenuName
OperationRegistry.RegWrite "HKEY_CLASSES_ROOT\Directory\shell\NodeJS\command\","cmd.exe /k cd %1 & "+Root+"\jsc"

MSG="Success!~"
MsgBox MSG