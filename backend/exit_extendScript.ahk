; AutoHotkey v2.x Syntax

SetTitleMatchMode(2)  ; Allow partial matches

; Try to find the ExtendScript Toolkit window by its class or executable name
If WinExist("ahk_class Estoolkit35") or WinExist("ahk_exe ExtendScript Toolkit.exe") {
    WinActivate()  ; Activate the found window
    Sleep(1000)    ; Wait briefly to ensure activation
    WinClose()     ; Close the active window
} else {
    MsgBox("The ExtendScript Toolkit window was not found!")
}
