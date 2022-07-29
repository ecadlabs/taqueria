import * as path from 'path';
import * as vscode from 'vscode';
import { HasFileName, HasRefresh, VsCodeHelper } from '../helpers';

export class ArtifactsDataProvider implements vscode.TreeDataProvider<ArtifactTreeItem>, HasRefresh {
	constructor(
		private workspaceRoot: string,
		private helper: VsCodeHelper,
	) {}

	getTreeItem(element: ArtifactTreeItem): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: ArtifactTreeItem): Promise<ArtifactTreeItem[]> {
		const artifacts = await vscode.workspace.findFiles('artifacts/*.*', '**/node_modules/**');

		const treeItems = artifacts.map(uri =>
			new ArtifactTreeItem(
				path.basename(uri.path),
				vscode.TreeItemCollapsibleState.None,
			)
		);
		return treeItems;
	}

	private _onDidChangeTreeData: vscode.EventEmitter<ArtifactTreeItem | undefined | null | void> = new vscode
		.EventEmitter<
		ArtifactTreeItem | undefined | null | void
	>();
	readonly onDidChangeTreeData: vscode.Event<ArtifactTreeItem | undefined | null | void> =
		this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}

export class ArtifactTreeItem extends vscode.TreeItem implements HasFileName {
	fileName: string;

	constructor(
		readonly label: string,
		readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(label, collapsibleState);
		this.tooltip = `${label}`;
		this.fileName = label;
	}
}
