import * as vscode from 'vscode';
import { CoinProvider } from './coinProvider';

export function activate(context: vscode.ExtensionContext) {

	const coinProvider =  new CoinProvider();
	vscode.window.registerTreeDataProvider('coinsListView', coinProvider);
	vscode.commands.registerCommand('coinsListView.refreshEntry', () =>
    	coinProvider.refresh()
  	);
}

export function deactivate() {}
