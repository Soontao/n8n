import { IExecuteFunctions } from 'n8n-core';
import { Client } from "ssh2"
import {
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
} from 'n8n-workflow';


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
		]
	}

	state = 0;

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const plainAuthCredential = this.getCredentials("sftpUserPasswordCredential")

		if (!plainAuthCredential) {
			throw new Error('Credentials are mandatory!');
		}

		return new Promise((resolve, reject) => {

			const client = new Client()

			client.on('ready', () => {

				client.sftp((err, sftp) => {

					if(err){
						reject(err)
						return
					}

					const onClose = async () => {

					}

					const onManualTrigger = async () => {
					}

					resolve({
						closeFunction: onClose,
						manualTriggerFunction: onManualTrigger
					})

				})

			})

			client.on("error", err => {
				reject(err)
			})

			client.connect({
				host: plainAuthCredential.host as 'string',
				port: plainAuthCredential.port as number,
				username: plainAuthCredential.username as 'string',
				password: plainAuthCredential.password as 'password'
			})

		})

	}

}
