import * as vscode from "vscode";
import { Utils } from "vscode-uri";
import * as _ from "lodash";

import Jest from "./jest";

/**
 * @class Golang representing facebooks Golang test environment.
 * @author Amaury Diaz
 */
export default class Golang extends Jest {
  /**
   * @protected File extensions that matches for a testeable file.
   */
  protected allowedExtensions = [".go"];

  /**
   * @protected Substrings indicating that the file is already a test file and it doesn't need to be testeable.
   */
  protected testNameIndicator = ["_test."];

  /**
   * @protected Folders that contains either test files or non testeable files.
   */
  protected excludeIndicator = ["mocks"];

  isSet(context: vscode.ExtensionContext): boolean {
    // TODO: Needs proper implementation...
    return true;
  }

  testFileUri(file: vscode.Uri): vscode.Uri {
    const extension = Utils.extname(file);
    const filename = Utils.basename(file);
    const location = Utils.dirname(file).path;

    return vscode.Uri.file(
      location + "/" + filename.replace(extension, "_test" + extension)
    );
  }
}
