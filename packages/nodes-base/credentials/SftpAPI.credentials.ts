import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class SftpAPI implements ICredentialType {
	name = 'sftpUserPasswordCredential';
	displayName = 'Sftp User Password Credential';
	properties = [
		{
			displayName: 'Hostname',
			name: 'host',
			type: 'string' as NodePropertyTypes,
			default: ''
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number' as NodePropertyTypes,
			default: 22
		},
		{
			displayName: 'User',
			name: 'user',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
