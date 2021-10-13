import * as vscode from "vscode";
import * as utils from "./utils";
import testSuites from "./suites";

export function activate(context: vscode.ExtensionContext) {
  let active: boolean = false;

  const suites = () =>
    active ? testSuites.filter((s) => s.isSet(context)) : [];

  const testSide = () => vscode.ViewColumn.Two;
  const codeSide = () =>
    testSide() === vscode.ViewColumn.Two
      ? vscode.ViewColumn.One
      : vscode.ViewColumn.Two;

  // activate button definition
  const activateButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );

  const updateActivateButton = () => {
    // activateButton.color = active ? "#FF0000" : "#00FF00";
    const icon = active ? "$(testing-passed-icon)" : "$(error)";
    activateButton.text = `${icon} TDD Zen`;
  };

  // activate command
  const activateCommandId = "tdd-zen.activate";
  context.subscriptions.push(
    vscode.commands.registerCommand(activateCommandId, () => {
      active = !active;
      updateActivateButton();
    })
  );

  // activate functionality setup
  activateButton.command = activateCommandId;
  updateActivateButton();
  activateButton.show();

  context.subscriptions.push(activateButton);

  vscode.window.onDidChangeActiveTextEditor(async (data) => {
    if (data) {
      const { uri: file } = data.document;

      const suite = utils.getTestSuite(file, ...suites());
      if (suite) {
        const testfile = suite.testFileUri(file);
        await utils.createFile(testfile);

        const testColumn = testSide();
        const codeColumn = codeSide();

        vscode.window.showTextDocument(testfile, {
          viewColumn: testColumn,
          preserveFocus: true,
        });

        if (data.viewColumn === testColumn) {
          vscode.window.showTextDocument(file, {
            viewColumn: codeColumn,
            preserveFocus: true,
          });
        }
      }
    }
  });

  vscode.workspace.onWillRenameFiles(
    async ({ files }) =>
      await Promise.all(
        files.map(async ({ newUri, oldUri }) => {
          const suite = utils.getTestSuite(oldUri, ...suites());
          if (suite) {
            const oldtest = suite.testFileUri(oldUri);
            const newtest = suite.testFileUri(newUri);

            return utils.renameFile(oldtest, newtest);
          }
        })
      )
  );

  vscode.workspace.onWillDeleteFiles(
    async ({ files }) =>
      await Promise.all(
        files.map(async (file) => {
          const suite = utils.getTestSuite(file, ...suites());
          if (suite) {
            const testfile = suite.testFileUri(file);

            return utils.deleteFile(testfile);
          }
        })
      )
  );
}

export function deactivate() {}
