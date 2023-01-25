// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";

export class TaskProvider implements vscode.TreeDataProvider<Task> {
  constructor(private workspaceRoot: string | undefined) {}

  getTreeItem(element: Task): vscode.TreeItem {
    return element;
  }
  private _onDidChangeTreeData: vscode.EventEmitter<
    Task | undefined | null | void
  > = new vscode.EventEmitter<Task | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Task | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getChildren(element?: Task): Thenable<Task[]> {
    if (!element) {
      return new Promise((resolve) => {
        const dir = this.workspaceRoot;
        cp.exec(`xc -short`, { cwd: dir }, (err, stdout, stderr) => {
          if (err) {
            resolve([]);
            return;
          }
          let items: Task[] = [];
          stdout.split("\n").forEach((t) => {
            if (!t) {
              return;
            }
            items.push(new Task(t, ""));
          });
          resolve(items);
        });
      });
    }
    return Promise.resolve([]);
  }
}

export class Task extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string
  ) {
    super(label);
    this.command = {
      command: "xc-vscode.xc",
      title: "",
      arguments: [label],
    };
  }

  contextValue = "Task";

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'xc.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'xc.svg')
	};
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : "";

  vscode.commands.registerCommand("xc-vscode.xc", (cmd) => {
    const term =
      vscode.window.terminals.find((t) => t.name === "xc-vscode") ??
      vscode.window.createTerminal("xc-vscode");

    term.sendText("cd " + rootPath, true);
    term.sendText("xc " + cmd, true);
    term.show();
  });
  const taskProvider = new TaskProvider(rootPath);
  vscode.window.createTreeView("xc-vscode.xcTasks", {
    treeDataProvider: taskProvider,
  });
  vscode.window.createTreeView("xc-vscode.xcTasksContainer", {
    treeDataProvider: taskProvider,
  });

  vscode.commands.registerCommand("xc-vscode.refreshEntry", () =>
    taskProvider.refresh()
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
