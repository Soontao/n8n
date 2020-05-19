import { IExecuteFunctions } from 'n8n-core';
import {
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
	INodeExecutionData,
} from 'n8n-workflow';

import { Client, ConnectConfig, SFTPWrapper, } from "ssh2"
import { Stats } from 'fs';


interface IFileContent {
	name: string;
	binary: Buffer;
}

class SFTPClient {

	private _opt: ConnectConfig = {}
	private _client: Client;
	private _sftp!: SFTPWrapper;

	constructor(opt: ConnectConfig) {
		this._opt = opt
		this._client = new Client()
	}

	async	connect(): Promise<SFTPClient> {
		return new Promise((resolve, reject) => {
			this._client.on("error", reject)
			this._client.on("ready", () => {
				this._client.sftp((err, sftp) => {
					if (err) {
						reject(err)
					} else {
						this._sftp = sftp
						resolve(this)
					}
				})
			})
			this._client.connect(this._opt)
		})
	}

	async stat(path: string): Promise<Stats> {
		return new Promise((resolve, reject) => {
			this._sftp.stat(path, (err, stats) => {
				if (err) {
					reject(err)
				} else {
					resolve(stats as any)
				}
			})
		})
	}

	async readdir(path: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			this._sftp.readdir(path, (err, list) => {
				if (err) {
					reject(err)
				} else {
					resolve(list.map(f => f.longname))
				}
			})
		})
	}

	async readFile(path: string): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			this._sftp.readFile(path, (err, buff) => {
				if (err) {
					reject(err)
				} else {
					resolve(buff)
				}
			})
		})
	}

}


export class SFTPTrigger implements INodeType {

	description: INodeTypeDescription = {
		displayName: "SFTP Trigger",
		name: "sftpTrigger",
		group: ["trigger"],
		version: 1,
		icon: 'file:sftp.png',
		description: "SFTP Trigger",
		defaults: {
			name: "SFTP Trigger",
			color: "#095da6"
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: "sftpUserPasswordCredential",
				required: true
			}
		],
		properties: [
			{
				displayName: 'Remote Path',
				name: 'remotePath',
				type: 'string',
				default: '/',
				required: true,
				placeholder: '/',
				description: 'Path of the file (directory) to read.',
			},
		]
	}

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const plainAuthCredential = this.getCredentials("sftpUserPasswordCredential")
		const remotePath = this.getNodeParameter("remotePath") as string

		if (!plainAuthCredential) {
			throw new Error('Credentials are mandatory!');
		}

		const client = new SFTPClient({
			host: plainAuthCredential.host as string,
			username: plainAuthCredential.user as string,
			password: plainAuthCredential.password as string,
		})

		await client.connect()

		const stat = await client.stat(remotePath)
		const files: IFileContent[] = []

		if (stat.isDirectory()) {
			const list = await client.readdir(remotePath)
			const remoteFiles = await Promise.all(
				list.map(
					async f => ({ name: f, binary: await client.readFile(f) })
				)
			)
			remoteFiles.forEach(f => files.push(f))
		} else if (stat.isFile()) {

			files.push({
				name: remotePath,
				binary: await client.readFile(remotePath)
			})

		} else {

			throw new Error(`${remotePath} is not file or directory`)

		}

		const items: INodeExecutionData[][] = []


		this.emit(items)

		return {
			closeFunction: async () => {

			},
			manualTriggerFunction: async () => {

			}
		}

	}

}
