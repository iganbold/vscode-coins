import * as vscode from 'vscode';
import fetch from 'node-fetch';

export class CoinProvider implements vscode.TreeDataProvider<Coin> {
    
    private _onDidChangeTreeData: vscode.EventEmitter<Coin | undefined | null | void> = new vscode.EventEmitter<Coin | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Coin | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor () {}

    async getCoins(): Promise<Coin[]> {
        try {
            const response =  await fetch('https://api.coincap.io/v2/assets');
            const coincap = await response.json();
            let coins: Coin[] = coincap.data.map((coin:any) => {
                const graph = coin.changePercent24Hr >= 0 ? '🟢' : '🔴';
                return new Coin(
                    `${graph} ${coin.name} (${coin.symbol})`, 
                    `$${parseFloat(coin.priceUsd).toFixed(2)}`, 
                    this.getCoinDetails(coin)
                );
        });
            return coins;
        } catch (error) {
            vscode.window.showInformationMessage(`${error}`);
        }

        return [];
    }

    getCoinDetails(coin: any): Coin[] {
        const graph = coin.changePercent24Hr >= 0 ? '📈' : '📉';
        
        return [
            new Coin(`${graph} Change (24Hr)`, `${parseFloat(coin.changePercent24Hr).toFixed(2)}%`),
            new Coin('🧢 Market Cap', `$${this.convertNumber(coin.marketCapUsd)}`),
            new Coin('🔈 Volume (24Hr)', `$${this.convertNumber(coin.volumeUsd24Hr)}`)
        ];
    }

    getTreeItem(element: Coin): vscode.TreeItem|Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: Coin|undefined): vscode.ProviderResult<Coin[]> { 
        if (element === undefined) {
            return Promise.resolve(this.getCoins());
          }
        
          return element.children;
    }

    convertNumber(labelValue: string) {
        const sign = Math.sign(Number(labelValue));

        // Nine Zeroes for Billions
        return Math.abs(Number(labelValue)) >= 1.0e+9

        ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "b"
        // Six Zeroes for Millions 
        : Math.abs(Number(labelValue)) >= 1.0e+6

        ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2)  + "m"
        // Three Zeroes for Thousands
        : Math.abs(Number(labelValue)) >= 1.0e+3

        ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2)  + "k"

        : Math.abs(Number(labelValue));
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class Coin extends vscode.TreeItem {
    children: Coin[] | undefined;

    constructor(label: string, price: string, children?: Coin[]) {
        super(label,  children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Collapsed);
        this.children = children;
        this.description = price;
    }    
}