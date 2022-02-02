// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as cp from "child_process";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "xc-vscode.xc",
    () => {
		const dir = (vscode.workspace.workspaceFolders||[])[0]?.uri.path
      cp.exec(`xc -short`, {cwd:dir}, (err, stdout, stderr) => {
        console.log("stdout: " + stdout);
        if (err) {
          console.log("error: " + err);
        }

        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        let items: vscode.QuickPickItem[] = [];
        stdout.split("\n").forEach((t) => {
          if (!t) return;
          items.push({
            label: t,
            description: `xc ${t}`,
          });
        });
        vscode.window.showQuickPick(items).then((selection) => {
          // the user canceled the selection
          if (!selection) {
            return;
          }
		  const cmd = selection.description?.toString() || ""
		  const term = vscode.window.createTerminal(cmd)
		  term.sendText("cd "+dir, true)
		  term.sendText(cmd, true)
		  term.show()
        });
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
