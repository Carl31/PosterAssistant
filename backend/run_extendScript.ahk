; AutoHotkey v2.x Syntax

SetTitleMatchMode(2)  ; Allow partial matches

; Try to find the ExtendScript Toolkit window by its class or executable name
If WinExist("ahk_class Estoolkit35") or WinExist("ahk_exe ExtendScript Toolkit.exe") {
    WinActivate()  ; Activate the found window
    Sleep(2000)    ; Wait a moment to allow the window to come to the front
    Send("{F5}")   ; Send F5 to run the script
} else {
    MsgBox("The ExtendScript Toolkit window was not found!")
}
