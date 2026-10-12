import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, Battery, BookOpen, Boxes, Cloud, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Database,
  Clock3, Code2, Command, Computer, Container, File, FileCode2, FileImage, FileText,
  Folder, FolderOpen, GitBranch, HardDrive, Home, Image, LayoutGrid, List, Maximize2,
  LockKeyhole, Minus, MoreHorizontal, Music2, Network, Plus, Power, Search, Settings,
  ShieldCheck, Terminal as TerminalIcon, Trash2, Wifi, X,
} from 'lucide-react';

const initialFiles = {
  '/': { type: 'dir', children: ['home', 'etc', 'var', 'tmp', 'usr'] },
  '/home': { type: 'dir', children: ['learner'] },
  '/home/learner': { type: 'dir', children: ['Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Projects', '.Trash', 'readme.txt', '.bashrc'] },
  '/home/learner/.Trash': { type: 'dir', children: [] },
  '/home/learner/Documents': { type: 'dir', children: ['welcome.txt', 'linux-notes.md'] },
  '/home/learner/Downloads': { type: 'dir', children: [] },
  '/home/learner/Pictures': { type: 'dir', children: [] },
  '/home/learner/Music': { type: 'dir', children: [] },
  '/home/learner/Videos': { type: 'dir', children: [] },
  '/home/learner/Projects': { type: 'dir', children: ['hello.sh'] },
  '/home/learner/Documents/welcome.txt': { type: 'file', content: 'Welcome to your Ubuntu learning desktop!\n\nThis is a safe, simulated Linux environment. Your practice stays in this browser.' },
  '/home/learner/Documents/linux-notes.md': { type: 'file', content: '# Linux notes\n\n- Use `pwd` to show your location.\n- Use `ls` to explore files.\n- Use `cd Documents` to open a folder.' },
  '/home/learner/Projects/hello.sh': { type: 'file', content: '#!/bin/bash\necho "Hello from your practice sandbox!"' },
  '/home/learner/readme.txt': { type: 'file', content: 'Welcome!\n\nThis is your safe, simulated Ubuntu desktop.\nTry the Files app or Terminal to explore.\nChanges are saved locally in this browser.' },
  '/home/learner/.bashrc': { type: 'file', content: '# Your simulated shell configuration\nexport EDITOR=nano\nalias ll="ls -la"' },
  '/etc': { type: 'dir', children: ['hostname', 'os-release'] },
  '/etc/hostname': { type: 'file', content: 'ubuntu-learning' },
  '/etc/os-release': { type: 'file', content: 'NAME="Ubuntu Learning Desktop"\nVERSION="24.04 LTS (simulated)"\nID=ubuntu' },
  '/var': { type: 'dir', children: ['log'] },
  '/var/log': { type: 'dir', children: ['syslog'] },
  '/var/log/syslog': { type: 'file', content: 'System ready. Simulated desktop initialized.' },
  '/tmp': { type: 'dir', children: [] },
  '/usr': { type: 'dir', children: ['bin', 'share'] },
  '/usr/bin': { type: 'dir', children: ['bash', 'cat', 'ls'] },
  '/usr/share': { type: 'dir', children: [] },
};

const normalize = (path) => {
  const parts = [];
  path.split('/').forEach((part) => {
    if (!part || part === '.') return;
    if (part === '..') parts.pop(); else parts.push(part);
  });
  return `/${parts.join('/')}`;
};
const displayPath = (path) => path === '/home/learner' ? '~' : path.startsWith('/home/learner/') ? `~${path.slice(13)}` : path;
const basename = (path) => path.split('/').filter(Boolean).at(-1) || 'Home';
const fileIcon = (name, type) => {
  if (type === 'dir') return <Folder size={19} fill="currentColor" strokeWidth={1.6} />;
  if (/\.(png|jpe?g|gif|svg)$/i.test(name)) return <FileImage size={19} />;
  if (/\.(js|jsx|py|sh|html|css)$/i.test(name)) return <FileCode2 size={19} />;
  if (/\.(mp3|wav)$/i.test(name)) return <Music2 size={19} />;
  return <FileText size={19} />;
};

const learningTracks = [
  { id: 'linux', title: 'Linux', subtitle: 'Learn the command line and system basics', level: 'Beginner', icon: <TerminalIcon />, color: 'track-linux', lessons: [
    ['Meet the terminal', 'Understand the prompt, commands, and safe practice environment.', 'Try `pwd` to see your current location, then run `whoami`.', 'pwd'],
    ['Navigate files and folders', 'Move around the Linux filesystem with paths.', 'List your home folder and open Documents.', 'ls'],
    ['Create and manage files', 'Create folders and files, copy them, rename them, and use Trash.', 'Create a practice folder with `mkdir practice`.', 'mkdir practice'],
    ['Read and edit text', 'Inspect text files and learn where configuration files live.', 'Read the welcome note with `cat readme.txt`.', 'cat readme.txt'],
    ['Permissions and users', 'Learn what user accounts and file permissions control.', 'Check the current user with `whoami` and inspect `/etc/os-release`.', 'cat /etc/os-release'],
    ['Processes and networking', 'Get familiar with system status and basic network concepts.', 'Review the simulated system log under `/var/log`.', 'ls /var/log'],
  ] },
  { id: 'cloud', title: 'Cloud basics', subtitle: 'Understand cloud computing before choosing a provider', level: 'Beginner', icon: <Cloud />, color: 'track-cloud', tools: ['AWS', 'Azure', 'Google Cloud', 'IAM', 'Compute', 'Storage', 'Networking', 'Monitoring'], lessons: [
    ['What is cloud computing?', 'Learn on-demand computing, regions, and shared responsibility.', 'Compare a local folder with a cloud object storage bucket.', 'cloud concepts'],
    ['Compute, storage, and networking', 'See how virtual machines, object storage, and virtual networks fit together.', 'Match a web app to compute, storage, and network services.', 'cloud services'],
    ['Identity and access', 'Use least privilege to decide who can access cloud resources.', 'Sketch a read-only role for a student account.', 'least privilege'],
    ['Costs and reliability', 'Plan budgets, backups, and availability zones for a small service.', 'Choose a backup and budget alert for a demo website.', 'cloud planning'],
  ] },
  { id: 'aws', title: 'Amazon Web Services', subtitle: 'Explore AWS building blocks and workflows', level: 'Beginner', icon: <Cloud />, color: 'track-aws', tools: ['AWS Console', 'IAM', 'EC2', 'S3', 'VPC', 'CloudWatch'], lessons: [
    ['AWS global infrastructure', 'Learn regions, availability zones, and edge locations.', 'Choose a region near your users and explain the tradeoff.', 'aws regions'],
    ['IAM and shared responsibility', 'Understand IAM users, roles, policies, and account safety.', 'Design a least-privilege read-only role for a demo project.', 'aws iam'],
    ['EC2 compute', 'Learn how virtual machines are launched and secured.', 'Plan a small Linux web server with a restricted security group.', 'aws ec2'],
    ['S3 storage', 'Use object storage concepts for static assets and backups.', 'Plan a bucket layout for a website and its backup files.', 'aws s3'],
    ['VPC and monitoring', 'Connect subnets, routes, security groups, and basic monitoring.', 'Trace a request from a public subnet to a web server.', 'aws vpc'],
  ] },
  { id: 'azure', title: 'Microsoft Azure', subtitle: 'Learn Azure resources, identity, and operations', level: 'Beginner', icon: <Cloud />, color: 'track-azure', tools: ['Azure Portal', 'Entra ID', 'RBAC', 'Virtual Machines', 'Blob Storage', 'Monitor'], lessons: [
    ['Azure regions and resource groups', 'Organize services and understand Azure infrastructure.', 'Group a demo web app and its database by environment.', 'azure resources'],
    ['Microsoft Entra ID and RBAC', 'Learn identity, roles, and scoped access control.', 'Give a student access to view, but not change, resources.', 'azure rbac'],
    ['Virtual machines and storage', 'Explore Azure compute and storage choices.', 'Choose a VM and storage plan for a small website.', 'azure compute'],
    ['Virtual networks and monitoring', 'Connect network components and inspect service health.', 'Outline a web tier and private database subnet.', 'azure network'],
  ] },
  { id: 'gcp', title: 'Google Cloud', subtitle: 'Explore GCP projects, IAM, and core services', level: 'Beginner', icon: <Cloud />, color: 'track-gcp', tools: ['Google Cloud Console', 'IAM', 'Compute Engine', 'Cloud Storage', 'VPC', 'Monitoring'], lessons: [
    ['Projects and resource hierarchy', 'Understand organizations, folders, and projects.', 'Separate a practice project from a production project.', 'gcp projects'],
    ['IAM and service accounts', 'Use roles and service identities with least privilege.', 'Give an app a narrowly scoped service account.', 'gcp iam'],
    ['Compute Engine and Cloud Storage', 'Learn virtual machine and object storage fundamentals.', 'Pick compute and storage for a static demo site.', 'gcp compute'],
    ['VPC and operations', 'Explore VPC networks, logging, and monitoring.', 'Plan a basic network and an alert for an unavailable service.', 'gcp network'],
  ] },
  { id: 'devops', title: 'DevOps', subtitle: 'Build, ship, and operate software with confidence', level: 'Beginner', icon: <GitBranch />, color: 'track-devops', tools: ['Git', 'GitHub', 'CI/CD', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'Monitoring'], lessons: [
    ['Git essentials', 'Track changes and collaborate with branches and commits.', 'Create a feature branch and describe a useful commit.', 'git workflow'],
    ['CI and automated checks', 'Run repeatable checks whenever code changes.', 'Plan a pipeline that installs dependencies and builds the app.', 'continuous integration'],
    ['Containers with Docker', 'Package an application and its dependencies as an image.', 'Describe the difference between an image and a running container.', 'docker basics'],
    ['Kubernetes concepts', 'Understand pods, deployments, and services at a high level.', 'Choose a deployment and service for a small web app.', 'kubernetes concepts'],
    ['Infrastructure as code', 'Describe repeatable cloud setup and safe change review.', 'Write down the resources a demo app needs before provisioning.', 'infrastructure as code'],
    ['Monitoring and incident response', 'Use logs, metrics, and alerts to investigate service issues.', 'Create a simple alert and an incident checklist.', 'service monitoring'],
  ] },
  { id: 'server', title: 'Server Engineering', subtitle: 'Learn how web servers work and how to operate them', level: 'Beginner', icon: <Computer />, color: 'track-server', tools: ['Linux', 'HTTP', 'DNS', 'SSH', 'Nginx', 'systemd', 'Logs'], lessons: [
    ['How clients and servers work', 'Understand requests, responses, ports, and the role of a server.', 'Trace what happens when a browser requests a page.', 'server basics'],
    ['DNS and domain names', 'Learn how a domain name points a browser toward a server.', 'Describe the lookup from example.test to a server address.', 'dns basics'],
    ['Linux server essentials', 'Practice the shell, directories, users, and service logs.', 'Inspect the simulated operating-system information in `/etc`.', 'cat /etc/os-release'],
    ['Web servers and reverse proxies', 'Understand how Nginx or Apache can serve pages and route requests.', 'Draw a path from a browser through a reverse proxy to an app.', 'web server'],
    ['Logs and troubleshooting', 'Use logs and health checks to narrow down common problems.', 'Read the simulated system log and identify its status message.', 'cat /var/log/syslog'],
    ['Safe access and deployment', 'Learn SSH purpose, least privilege, backups, and deployment checks.', 'Write a short pre-deployment checklist for a demo service.', 'server checklist'],
  ] },
];

const cloudPlatforms = {
  aws: { name: 'AWS', identity: 'IAM', compute: 'EC2', storage: 'S3', network: 'VPC', monitoring: 'CloudWatch', audit: 'CloudTrail', tools: ['IAM', 'EC2', 'S3', 'VPC', 'Lambda', 'RDS', 'EKS', 'CloudWatch', 'CloudTrail'], policy: '{\n  "Effect": "Allow",\n  "Action": ["s3:GetObject"],\n  "Resource": "arn:aws:s3:::demo-bucket/*"\n}' },
  azure: { name: 'Azure', identity: 'Entra ID + RBAC', compute: 'Virtual Machines', storage: 'Blob Storage', network: 'Virtual Network', monitoring: 'Azure Monitor', audit: 'Activity Log', tools: ['Entra ID', 'RBAC', 'Virtual Machines', 'Blob Storage', 'Virtual Network', 'Functions', 'Azure SQL', 'Monitor', 'Activity Log'], policy: 'Role: Storage Blob Data Reader\nScope: demo storage account\nAccess: read blob data only' },
  gcp: { name: 'Google Cloud', identity: 'Cloud IAM', compute: 'Compute Engine', storage: 'Cloud Storage', network: 'VPC Network', monitoring: 'Cloud Monitoring', audit: 'Cloud Audit Logs', tools: ['Cloud IAM', 'Compute Engine', 'Cloud Storage', 'VPC', 'Cloud Functions', 'Cloud SQL', 'GKE', 'Monitoring', 'Audit Logs'], policy: 'Role: roles/storage.objectViewer\nResource: demo bucket\nAccess: view objects only' },
};

function CloudLab({ providerId, onProviderChange }) {
  const [role, setRole] = useState('developer');
  const [resource, setResource] = useState('compute');
  const [action, setAction] = useState('view');
  const [result, setResult] = useState(null);
  const [cliInput, setCliInput] = useState('');
  const [cliOutput, setCliOutput] = useState([{ kind: 'muted', text: 'Cloud CLI sandbox ready. Commands and resources are simulated in this browser.' }]);
  const [createdResources, setCreatedResources] = useState({ aws: [], azure: [], gcp: [] });
  const [section, setSection] = useState('visual');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [networkPlan, setNetworkPlan] = useState('three-tier');
  const [networkReady, setNetworkReady] = useState(false);
  const [databaseType, setDatabaseType] = useState('managed-sql');
  const [databasePrivate, setDatabasePrivate] = useState(true);
  const [databaseEncrypted, setDatabaseEncrypted] = useState(true);
  const [databasePlan, setDatabasePlan] = useState(false);
  const [securityControls, setSecurityControls] = useState({ mfa: true, leastPrivilege: true, encryption: false, audit: true });
  const [securityReviewed, setSecurityReviewed] = useState(false);
  const [flowStep, setFlowStep] = useState(-1);
  const [flowRunning, setFlowRunning] = useState(false);
  const provider = cloudPlatforms[providerId] || cloudPlatforms.aws;
  const databaseService = providerId === 'aws' ? 'Amazon RDS' : providerId === 'azure' ? 'Azure SQL' : 'Cloud SQL';
  const flowNodes = [
    { title: 'User', subtitle: 'Browser request', icon: <Cloud size={19} />, detail: 'A user opens the application URL. The browser sends an HTTPS request.' },
    { title: 'DNS', subtitle: 'Find service address', icon: <Network size={19} />, detail: 'DNS resolves the domain name to the public entry point for the application.' },
    { title: 'Security', subtitle: 'TLS + access rules', icon: <ShieldCheck size={19} />, detail: 'TLS protects the connection. A firewall or web application filter allows only approved traffic.' },
    { title: 'Network', subtitle: provider.network, icon: <Network size={19} />, detail: 'The virtual network routes approved traffic to the public entry point while keeping internal tiers private.' },
    { title: 'Application', subtitle: provider.compute, icon: <Computer size={19} />, detail: 'The application compute tier handles the request and asks for data only when needed.' },
    { title: 'Database', subtitle: databaseService, icon: <Database size={19} />, detail: 'The database stays on a private network. The app receives only the access it needs.' },
    { title: 'Operations', subtitle: `${provider.monitoring} + ${provider.audit}`, icon: <Activity size={19} />, detail: 'Metrics, logs, and audit records help operators monitor service health and review changes.' },
  ];
  useEffect(() => {
    if (!flowRunning) return undefined;
    if (flowStep >= flowNodes.length - 1) { setFlowRunning(false); return undefined; }
    const timer = setTimeout(() => setFlowStep((step) => step + 1), 950);
    return () => clearTimeout(timer);
  }, [flowRunning, flowStep, flowNodes.length]);
  const cliExamples = {
    aws: ['aws sts get-caller-identity', 'aws iam list-roles', 'aws s3 ls', 'aws ec2 describe-instances', 'aws s3 mb s3://practice-bucket'],
    azure: ['az account show', 'az role definition list --output table', 'az group list -o table', 'az vm list -o table', 'az group create --name practice-rg --location eastus'],
    gcp: ['gcloud config list', 'gcloud projects list', 'gcloud iam roles list', 'gcloud compute instances list', 'gcloud storage buckets list', 'gcloud storage buckets create gs://practice-bucket --location=us-central1'],
  };
  const runCloudCli = (raw) => {
    const command = raw.trim();
    if (!command) return;
    const out = [{ kind: 'prompt', text: `$ ${command}` }];
    const print = (text, kind = 'normal') => out.push({ kind, text });
    if (command === 'clear') { setCliOutput([]); setCliInput(''); return; }
    if (command === 'help') {
      print('Available simulated commands:', 'success');
      cliExamples[providerId].forEach((example) => print(`  ${example}`));
      print('  help    show examples'); print('  clear   clear this console');
    } else if (providerId === 'aws' && command === 'aws sts get-caller-identity') {
      print('{'); print('  "UserId": "AIDEMOUSER",'); print('  "Account": "000000000000",'); print('  "Arn": "arn:aws:iam::000000000000:user/demo-learner"'); print('}');
      print('Simulated identity only; no AWS account was contacted.', 'muted');
    } else if (providerId === 'aws' && command === 'aws iam list-roles') {
      print('ROLE NAME                 ATTACHED POLICIES'); print('DemoReadOnlyRole          ReadOnlyAccess'); print('DemoDeveloperRole         DemoComputeLimited');
    } else if (providerId === 'aws' && command === 'aws s3 ls') {
      print(createdResources.aws.length ? createdResources.aws.map((name) => `2026-10-12  ${name}`).join('\n') : '(no demo buckets yet)');
    } else if (providerId === 'aws' && command.startsWith('aws ec2 describe-instances')) {
      print('Reservations: []'); print('No demo instances are running.');
    } else if (providerId === 'aws' && command.startsWith('aws s3 mb s3://')) {
      const name = command.slice('aws s3 mb s3://'.length).trim();
      if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(name)) print('Bucket name is invalid for this demo.', 'error');
      else if (createdResources.aws.includes(name)) print(`make_bucket failed: ${name} already exists`, 'error');
      else { setCreatedResources((old) => ({ ...old, aws: [...old.aws, name] })); print(`make_bucket: s3://${name}`, 'success'); print('Created in the local simulation only.', 'muted'); }
    } else if (providerId === 'azure' && command === 'az account show') {
      print('{'); print('  "name": "Learning Sandbox (simulated)",'); print('  "id": "00000000-0000-0000-0000-000000000000",'); print('  "tenantId": "demo-tenant"'); print('}');
    } else if (providerId === 'azure' && command === 'az role definition list --output table') {
      print('ROLE                         DESCRIPTION'); print('Reader                       View resources'); print('Storage Blob Data Reader     Read blob data');
    } else if (providerId === 'azure' && command === 'az group list -o table') {
      print(['Name                 Location', '-------------------  --------', ...createdResources.azure.map((name) => `${name.padEnd(20)} eastus`)].join('\n'));
    } else if (providerId === 'azure' && command === 'az vm list -o table') {
      print('Name    ResourceGroup    PowerState'); print('(no demo virtual machines)');
    } else if (providerId === 'azure' && command === 'az storage account list -o table') {
      print('Name    ResourceGroup    Location'); print('(no demo storage accounts)');
    } else if (providerId === 'azure' && command.startsWith('az group create --name ')) {
      const match = command.match(/--name\s+([\w-]+)/); const name = match?.[1];
      if (!name) print('Usage: az group create --name practice-rg --location eastus', 'error');
      else if (createdResources.azure.includes(name)) print(`Resource group '${name}' already exists in this simulation.`, 'error');
      else { setCreatedResources((old) => ({ ...old, azure: [...old.azure, name] })); print(`{ "name": "${name}", "location": "eastus", "provisioningState": "Succeeded" }`, 'success'); print('Created in the local simulation only.', 'muted'); }
    } else if (providerId === 'gcp' && command === 'gcloud config list') {
      print('[core]'); print('account = learner@example.test'); print('project = learning-sandbox'); print(''); print('Simulated gcloud configuration.');
    } else if (providerId === 'gcp' && command === 'gcloud projects list') {
      print('PROJECT_ID          NAME                 PROJECT_NUMBER'); print('learning-sandbox    Learning Sandbox     000000000000');
    } else if (providerId === 'gcp' && command === 'gcloud iam roles list') {
      print('NAME                               TITLE'); print('roles/viewer                       Viewer'); print('roles/storage.objectViewer         Storage Object Viewer');
    } else if (providerId === 'gcp' && command === 'gcloud compute instances list') {
      print('NAME  ZONE  MACHINE_TYPE  STATUS'); print('(no demo instances)');
    } else if (providerId === 'gcp' && command === 'gcloud storage buckets list') {
      print(createdResources.gcp.length ? createdResources.gcp.map((name) => `gs://${name}`).join('\n') : '(no demo buckets yet)');
    } else if (providerId === 'gcp' && command.startsWith('gcloud storage buckets create gs://')) {
      const match = command.match(/create\s+gs:\/\/([^\s]+)/); const name = match?.[1];
      if (!name) print('Usage: gcloud storage buckets create gs://practice-bucket --location=us-central1', 'error');
      else if (createdResources.gcp.includes(name)) print(`Bucket '${name}' already exists in this simulation.`, 'error');
      else { setCreatedResources((old) => ({ ...old, gcp: [...old.gcp, name] })); print(`Creating gs://${name}...`, 'success'); print('Created in the local simulation only.', 'muted'); }
    } else {
      print(`${provider.name} demo CLI: command not found. Type help for supported examples.`, 'error');
    }
    setCliOutput((old) => [...old, ...out]); setCliInput('');
  };
  const evaluate = () => {
    let allowed = false;
    if (action === 'view') allowed = true;
    if (role === 'developer' && resource === 'compute' && ['create', 'update'].includes(action)) allowed = true;
    if (role === 'storage' && resource === 'storage' && action === 'update') allowed = true;
    if (role === 'administrator' && resource !== 'identity' && ['create', 'update'].includes(action)) allowed = true;
    const roleName = role === 'viewer' ? 'Read-only viewer' : role === 'developer' ? 'Developer' : role === 'storage' ? 'Storage operator' : 'Project administrator';
    const resourceName = provider[resource] || resource;
    const reasons = {
      viewer: 'This role can inspect resources, but cannot change them.',
      developer: resource === 'compute' ? 'Developers can create or update compute resources in this demo policy.' : 'Developer access is limited to viewing this resource type.',
      storage: resource === 'storage' ? 'Storage operators can update storage data, but cannot manage compute or identities.' : 'Storage operator access is limited to storage data.',
      administrator: resource === 'identity' ? 'Identity and permission changes require separate approval in this example.' : action === 'delete' ? 'Destructive actions are denied by default and require a reviewed change.' : 'The administrator can manage non-identity resources, excluding destructive actions.',
    };
    setResult({ allowed, roleName, resourceName, reason: reasons[role] });
  };
  const sections = [
    { id: 'visual', label: 'Visual Flow', icon: <Network size={16} /> },
    { id: 'permissions', label: 'Permissions', icon: <LockKeyhole size={16} /> },
    { id: 'networking', label: 'Networking', icon: <Network size={16} /> },
    { id: 'database', label: 'Database', icon: <Database size={16} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={16} /> },
    { id: 'cli', label: 'CLI Lab', icon: <TerminalIcon size={16} /> },
  ];
  return <div className="cloud-lab">
    <div className="cloud-lab-heading"><div><div className="lesson-kicker">{provider.name.toUpperCase()} · HANDS-ON CLOUD LAB</div><h3>Cloud practice workspace</h3><p>Build and test cloud skills in a safe local simulation. No account or credentials required.</p></div><ShieldCheck size={24} /></div>
    <div className="cloud-provider-tabs">{Object.entries(cloudPlatforms).map(([id, platform]) => <button key={id} className={providerId === id ? 'selected' : ''} onClick={() => { onProviderChange(id); setResult(null); }}>{platform.name}</button>)}</div>
    <div className={`cloud-lab-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className="cloud-lab-sidebar"><button className="cloud-sidebar-toggle" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? 'Collapse cloud sidebar' : 'Expand cloud sidebar'} title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}><ChevronLeft size={16} /></button><div className="cloud-sidebar-label">CLOUD TOOLS</div>{sections.map((item) => <button key={item.id} title={item.label} className={`cloud-section-nav ${section === item.id ? 'selected' : ''}`} onClick={() => setSection(item.id)}>{item.icon}<span>{item.label}</span></button>)}</aside>
      <div className="cloud-section-content">
        {section === 'visual' && <><div className="cloud-section-heading"><h4>How a cloud web request works</h4><p>Follow a browser request through a typical cloud app. Select a stage or play the walkthrough.</p></div><div className="flow-toolbar"><span>{provider.name} · sample three-tier application</span><button onClick={() => { setFlowStep(0); setFlowRunning(true); }}>{flowRunning ? 'Playing…' : '▶ Play request'}</button><button className="flow-reset" onClick={() => { setFlowRunning(false); setFlowStep(-1); }}>Reset</button></div><div className="cloud-flow-map" aria-label="Cloud request architecture flow">{flowNodes.map((node, index) => <React.Fragment key={node.title}><button className={`flow-node ${flowStep === index ? 'active' : ''} ${flowStep > index ? 'visited' : ''}`} onClick={() => { setFlowRunning(false); setFlowStep(index); }}><span className="flow-node-icon">{node.icon}</span><strong>{node.title}</strong><small>{node.subtitle}</small><i>{String(index + 1).padStart(2, '0')}</i></button>{index < flowNodes.length - 1 && <span className={`flow-connector ${flowStep > index ? 'lit' : ''}`} aria-hidden="true"><ChevronRight size={16} /></span>}</React.Fragment>)}</div><div className="flow-explanation"><div className="flow-step-label">{flowStep < 0 ? 'SELECT A STAGE' : `STEP ${String(flowStep + 1).padStart(2, '0')} OF ${String(flowNodes.length).padStart(2, '0')}`}</div><h5>{flowStep < 0 ? 'Start with the browser request' : flowNodes[flowStep].title}</h5><p>{flowStep < 0 ? 'Press “Play request” to watch traffic move from the user through the public entry point to private application data, then into monitoring.' : flowNodes[flowStep].detail}</p><div className="flow-note"><ShieldCheck size={14} /> This is an educational architecture diagram, not a deployed cloud network.</div></div></>}
        {section === 'permissions' && <><div className="cloud-section-heading"><h4>Permissions and IAM</h4><p>Assign only the access a person needs. Compare role, resource, and action.</p></div><div className="cloud-lab-grid"><section className="cloud-lab-card"><div className="cloud-lab-card-title"><LockKeyhole size={16} /> Permission simulator</div><label>Role<select value={role} onChange={(event) => { setRole(event.target.value); setResult(null); }}><option value="viewer">Read-only viewer</option><option value="developer">Developer</option><option value="storage">Storage operator</option><option value="administrator">Project administrator</option></select></label><label>Resource<select value={resource} onChange={(event) => { setResource(event.target.value); setResult(null); }}><option value="compute">{provider.compute}</option><option value="storage">{provider.storage}</option><option value="network">{provider.network}</option><option value="identity">{provider.identity}</option></select></label><label>Requested action<select value={action} onChange={(event) => { setAction(event.target.value); setResult(null); }}><option value="view">View</option><option value="create">Create</option><option value="update">Update</option><option value="delete">Delete</option></select></label><button className="simulate-access" onClick={evaluate}>Check access <ChevronRight size={15} /></button>{result && <div className={`access-result ${result.allowed ? 'allowed' : 'denied'}`}><strong>{result.allowed ? 'ACCESS ALLOWED' : 'ACCESS DENIED'}</strong><span>{result.roleName} → {result.resourceName} → {action}</span><p>{result.reason}</p></div>}</section><section className="cloud-lab-card cloud-config-card"><div className="cloud-lab-card-title"><Code2 size={16} /> {provider.name} policy example</div><p>Read-only access scoped to one demo storage resource.</p><pre>{provider.policy}</pre><div className="cloud-safety"><ShieldCheck size={14} /> Example only. Review scope before applying real policies.</div></section></div></>}
        {section === 'networking' && <><div className="cloud-section-heading"><h4>Networking playground</h4><p>Choose a simple topology and inspect how requests flow through cloud networks.</p></div><section className="cloud-lab-card"><label>Architecture<select value={networkPlan} onChange={(event) => { setNetworkPlan(event.target.value); setNetworkReady(false); }}><option value="three-tier">Three-tier web app</option><option value="static">Static website</option><option value="private">Private internal service</option></select></label><div className="network-diagram"><div><span>Internet</span><small>Public requests</small></div><ChevronRight /><div><span>{provider.network}</span><small>{networkPlan === 'private' ? 'Private access' : 'Public entry only'}</small></div><ChevronRight /><div><span>{provider.compute}</span><small>App tier</small></div>{networkPlan === 'three-tier' && <><ChevronRight /><div><span>{provider.storage}</span><small>Private data tier</small></div></>}</div><button className="simulate-access" onClick={() => setNetworkReady(true)}>Check network plan <ChevronRight size={15} /></button>{networkReady && <div className="access-result allowed"><strong>PLAN CHECKED</strong><p>{networkPlan === 'static' ? 'Serve static content from object storage and keep write access private.' : networkPlan === 'private' ? 'Keep the service private and allow access only from an approved network.' : 'Expose only the entry point. Keep the app and database tiers private, and allow only required traffic between tiers.'}</p></div>}</section></>}
        {section === 'database' && <><div className="cloud-section-heading"><h4>Database setup lab</h4><p>Practice choosing a managed database and setting safe access defaults.</p></div><section className="cloud-lab-card database-lab"><label>Database type<select value={databaseType} onChange={(event) => { setDatabaseType(event.target.value); setDatabasePlan(false); }}><option value="managed-sql">Managed relational database</option><option value="nosql">Managed NoSQL database</option><option value="warehouse">Analytics warehouse</option></select></label><label>Network access<select value={databasePrivate ? 'private' : 'public'} onChange={(event) => { setDatabasePrivate(event.target.value === 'private'); setDatabasePlan(false); }}><option value="private">Private network only</option><option value="public">Public endpoint</option></select></label><label>Encryption<select value={databaseEncrypted ? 'enabled' : 'disabled'} onChange={(event) => { setDatabaseEncrypted(event.target.value === 'enabled'); setDatabasePlan(false); }}><option value="enabled">Encryption enabled</option><option value="disabled">Encryption disabled</option></select></label><button className="simulate-access" onClick={() => setDatabasePlan(true)}>Review database plan <ChevronRight size={15} /></button>{databasePlan && <div className={`access-result ${databasePrivate && databaseEncrypted ? 'allowed' : 'denied'}`}><strong>{databasePrivate && databaseEncrypted ? 'GOOD STARTING CONFIGURATION' : 'REVIEW REQUIRED'}</strong><p>{databaseType === 'managed-sql' ? provider.storage === 'S3' ? 'For AWS, compare this database plan with Amazon RDS.' : provider.name === 'Azure' ? 'For Azure, compare this plan with Azure SQL Database.' : 'For Google Cloud, compare this plan with Cloud SQL.' : 'Confirm this database type fits the application data and query patterns.'} {databasePrivate ? 'Private access is enabled.' : 'A public endpoint increases exposure; restrict it before use.'} {databaseEncrypted ? 'Encryption is enabled.' : 'Enable encryption for stored data.'}</p></div>}</section></>}
        {section === 'security' && <><div className="cloud-section-heading"><h4>Security checklist</h4><p>Review identity, network, encryption, and audit controls for a small cloud project.</p></div><section className="cloud-lab-card security-lab">{[['mfa', 'Require MFA for privileged users'], ['leastPrivilege', 'Use least-privilege roles'], ['encryption', 'Encrypt stored data'], ['audit', `Enable ${provider.audit}`]].map(([key, label]) => <label className="security-check" key={key}><input type="checkbox" checked={securityControls[key]} onChange={(event) => { setSecurityControls((old) => ({ ...old, [key]: event.target.checked })); setSecurityReviewed(false); }} /><span>{label}</span></label>)}<button className="simulate-access" onClick={() => setSecurityReviewed(true)}>Review security setup <ChevronRight size={15} /></button>{securityReviewed && <div className={`access-result ${Object.values(securityControls).every(Boolean) ? 'allowed' : 'denied'}`}><strong>{Object.values(securityControls).filter(Boolean).length}/4 CONTROLS ENABLED</strong><p>{Object.values(securityControls).every(Boolean) ? 'Good baseline for this learning scenario. Continue to review logs and access as the project changes.' : 'Enable the remaining controls before treating this as a stronger baseline.'}</p></div>}</section></>}
        {section === 'cli' && <><div className="cloud-section-heading"><h4>Run {provider.name} CLI commands</h4><p>Commands run against simulated resources in this browser. Nothing is sent to a provider.</p></div><div className="cli-examples">{cliExamples[providerId].map((example) => <button key={example} onClick={() => setCliInput(example)}>{example}</button>)}</div><div className="cloud-terminal"><div className="cloud-terminal-output" aria-live="polite">{cliOutput.map((line, index) => <pre key={`${index}-${line.text}`} className={line.kind}>{line.text || '\u00a0'}</pre>)}</div><form onSubmit={(event) => { event.preventDefault(); runCloudCli(cliInput); }}><span>{providerId === 'aws' ? 'aws' : providerId === 'azure' ? 'az' : 'gcloud'} &gt;</span><input value={cliInput} onChange={(event) => setCliInput(event.target.value)} placeholder="Type a supported command or choose an example" aria-label={`${provider.name} CLI command`} autoComplete="off" spellCheck="false" /><button type="submit">Run</button></form></div></>}
      </div>
    </div>
  </div>;
}

function App() {
  const [fs, setFs] = useState(() => {
    try {
      const saved = localStorage.getItem('ubuntu-fs');
      if (!saved) return initialFiles;
      const stored = JSON.parse(saved);
      if (stored['/home/learner'] && !stored['/home/learner/.Trash']) {
        stored['/home/learner/.Trash'] = { type: 'dir', children: [] };
        if (!stored['/home/learner'].children.includes('.Trash')) stored['/home/learner'].children.push('.Trash');
      }
      return stored;
    }
    catch { return initialFiles; }
  });
  const [cwd, setCwd] = useState('/home/learner');
  const [activeApp, setActiveApp] = useState('files');
  const [minimizedApps, setMinimizedApps] = useState([]);
  const [appsOpen, setAppsOpen] = useState(false);
  const [filesPath, setFilesPath] = useState('/home/learner');
  const [fileQuery, setFileQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFile, setSelectedFile] = useState(null);
  const [terminalHistory, setTerminalHistory] = useState([
    { text: 'Welcome to Ubuntu Learning Desktop!', kind: 'success' },
    { text: 'This is a safe, simulated Linux terminal. Type help to get started.', kind: 'muted' },
    { text: '', kind: 'normal' },
  ]);
  const [command, setCommand] = useState('');
  const [clock, setClock] = useState(new Date());
  const [toast, setToast] = useState('');
  const [windowMax, setWindowMax] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [academyTrack, setAcademyTrack] = useState('linux');
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [cloudLabTab, setCloudLabTab] = useState('lessons');
  const [labProvider, setLabProvider] = useState('aws');
  const [completedLessons, setCompletedLessons] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ubuntu-lessons') || '[]'); } catch { return []; }
  });
  const terminalRef = useRef(null);
  const commandRef = useRef(null);
  const toastTimer = useRef(null);
  const history = useRef([]);
  const historyIndex = useRef(0);

  useEffect(() => { const timer = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { try { localStorage.setItem('ubuntu-fs', JSON.stringify(fs)); } catch { /* browser storage may be unavailable */ } }, [fs]);
  useEffect(() => { try { localStorage.setItem('ubuntu-lessons', JSON.stringify(completedLessons)); } catch { /* browser storage may be unavailable */ } }, [completedLessons]);
  useEffect(() => { if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight; }, [terminalHistory]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeApp !== 'files' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'F2') { event.preventDefault(); renameSelected(); }
      if (event.key === 'Delete' && selectedFile) { event.preventDefault(); trashOpen ? restoreSelected() : deleteSelected(); }
      if (event.key === 'Enter' && selectedFile) { event.preventDefault(); const path = normalize(`${filesPath}/${selectedFile}`); openFile({ name: selectedFile, path, item: fs[path] }); }
      if (event.key === 'Escape' && fileMenuOpen) setFileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeApp, selectedFile, filesPath, fs, trashOpen, fileMenuOpen]);

  const notify = (message) => {
    setToast(message); clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };
  const entries = useMemo(() => {
    const node = fs[filesPath];
    if (!node || node.type !== 'dir') return [];
    return node.children.map((name) => ({ name, path: normalize(`${filesPath}/${name}`), item: fs[normalize(`${filesPath}/${name}`)] }))
      .filter((entry) => entry.name.toLowerCase().includes(fileQuery.toLowerCase()))
      .sort((a, b) => (a.item?.type === b.item?.type ? a.name.localeCompare(b.name) : a.item?.type === 'dir' ? -1 : 1));
  }, [fs, filesPath, fileQuery]);

  const changeFolder = (path) => {
    if (fs[path]?.type === 'dir') { setFilesPath(path); setTrashOpen(path === '/home/learner/.Trash'); setSelectedFile(null); setFileQuery(''); }
  };
  const openWindow = (id) => {
    setActiveApp(id);
    setMinimizedApps((old) => old.filter((item) => item !== id));
    if (id === 'files') setFileMenuOpen(false);
    if (id === 'terminal') setTimeout(() => commandRef.current?.focus(), 50);
  };
  const minimizeWindow = () => {
    if (!activeApp) return;
    setMinimizedApps((old) => old.includes(activeApp) ? old : [...old, activeApp]);
    setActiveApp(null);
  };
  const closeToHome = () => {
    setActiveApp(null);
    setMinimizedApps((old) => old.filter((id) => id !== activeApp));
    setWindowMax(false);
    setAppsOpen(false);
    setSettingsOpen(false);
    setFileMenuOpen(false);
  };
  const renameSelected = () => {
    if (!selectedFile) return;
    const oldPath = normalize(`${filesPath}/${selectedFile}`);
    const proposed = window.prompt('Enter a new name', selectedFile);
    if (proposed === null) return;
    const name = proposed.trim();
    if (!name || name === '.' || name === '..' || /[\\/]/.test(name)) { notify('Enter a valid file name'); return; }
    const newPath = normalize(`${filesPath}/${name}`);
    if (fs[newPath]) { notify('A file with that name already exists'); return; }
    setFs((old) => {
      const next = { ...old, [filesPath]: { ...old[filesPath], children: old[filesPath].children.map((child) => child === selectedFile ? name : child) }, [newPath]: old[oldPath] };
      delete next[oldPath];
      if (old[oldPath]?.type === 'dir') {
        Object.keys(old).forEach((path) => {
          if (path.startsWith(`${oldPath}/`)) {
            const relocated = `${newPath}${path.slice(oldPath.length)}`;
            next[relocated] = old[path];
            delete next[path];
          }
        });
      }
      return next;
    });
    setSelectedFile(name); notify(`Renamed to ${name}`);
  };
  const createFile = (kind) => {
    const base = kind === 'dir' ? 'New Folder' : 'New File.txt';
    let name = base; let count = 1;
    while (fs[normalize(`${filesPath}/${name}`)]) name = `${base.replace(/(\.txt)?$/, '')} ${count++}${base.endsWith('.txt') ? '.txt' : ''}`;
    const path = normalize(`${filesPath}/${name}`);
    setFs((old) => ({ ...old, [filesPath]: { ...old[filesPath], children: [...old[filesPath].children, name] }, [path]: kind === 'dir' ? { type: 'dir', children: [] } : { type: 'file', content: '' } }));
    setSelectedFile(name); notify(`${name} created`);
  };
  const deleteSelected = () => {
    if (!selectedFile) return;
    const path = normalize(`${filesPath}/${selectedFile}`);
    if (!fs[path]) return;
    if (filesPath === '/home/learner/.Trash') { notify('Items in Trash cannot be moved to Trash again'); return; }
    let trashName = selectedFile; let number = 1;
    while (fs[normalize(`/home/learner/.Trash/${trashName}`)]) trashName = `${selectedFile} (${number++})`;
    const targetPath = normalize(`/home/learner/.Trash/${trashName}`);
    setFs((old) => {
      const next = { ...old, [targetPath]: { ...old[path], trashedFrom: path }, '/home/learner/.Trash': { ...old['/home/learner/.Trash'], children: [...old['/home/learner/.Trash'].children, trashName] } }; delete next[path];
      next[filesPath] = { ...next[filesPath], children: next[filesPath].children.filter((name) => name !== selectedFile) };
      if (old[path].type === 'dir') Object.keys(old).forEach((child) => { if (child.startsWith(`${path}/`)) { const moved = `${targetPath}${child.slice(path.length)}`; next[moved] = old[child]; delete next[child]; } });
      return next;
    });
    notify(`${selectedFile} moved to Trash`); setSelectedFile(null);
  };
  const restoreSelected = () => {
    if (!trashOpen || !selectedFile) return;
    const source = normalize(`/home/learner/.Trash/${selectedFile}`); const item = fs[source];
    if (!item) return;
    let destination = item.trashedFrom || normalize(`/home/learner/${selectedFile}`);
    if (fs[destination]) destination = normalize(`/home/learner/${selectedFile}`);
    if (fs[destination]) { notify('Original location is occupied; clear it before restoring'); return; }
    let parent = normalize(`${destination}/..`);
    if (!fs[parent] || fs[parent].type !== 'dir') { destination = normalize(`/home/learner/${selectedFile}`); parent = '/home/learner'; }
    const targetParent = parent;
    setFs((old) => {
      const next = { ...old, [destination]: { ...item, trashedFrom: undefined }, [targetParent]: { ...old[targetParent], children: [...old[targetParent].children, basename(destination)] }, '/home/learner/.Trash': { ...old['/home/learner/.Trash'], children: old['/home/learner/.Trash'].children.filter((name) => name !== selectedFile) } }; delete next[source];
      if (item.type === 'dir') Object.keys(old).forEach((path) => { if (path.startsWith(`${source}/`)) { const moved = `${destination}${path.slice(source.length)}`; next[moved] = old[path]; delete next[path]; } });
      return next;
    });
    notify(`${selectedFile} restored`); setSelectedFile(null);
  };

  const runCommand = (raw) => {
    const text = raw.trim(); if (!text) return;
    history.current.push(text); historyIndex.current = history.current.length;
    const words = text.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const args = words.slice(1).map((word) => word.replace(/^['"]|['"]$/g, ''));
    const cmd = (words[0] || '').split('/').at(-1);
    const out = [{ text: `${displayPath(cwd)}$ ${text}`, kind: 'prompt' }];
    const add = (line, kind = 'normal') => out.push({ text: line, kind });
    const targetFor = (p) => normalize(p === '~' ? '/home/learner' : p.startsWith('~/') ? `/home/learner/${p.slice(2)}` : p.startsWith('/') ? p : `${cwd}/${p}`);
    const node = fs[cwd];
    switch (cmd) {
      case 'help':
        add('Available commands:', 'success');
        add('  ls [path] [-la]       list files and directories'); add('  cd [path]             change directory');
        add('  pwd                   print current directory'); add('  cat <file>            show file contents');
        add('  touch <file>          create an empty file'); add('  mkdir <directory>     create a directory');
        add('  echo <text>           print text to the terminal'); add('  clear                 clear the terminal');
        add('  whoami                show the current user'); add('  tree [path]           show directory tree');
        add('  mv <source> <name>    rename or move a file'); add('  cp <source> <name>    copy a file');
        add('  rm <file>             move a file to Trash'); add('  rmdir <directory>     remove an empty directory'); add('');
        add('Everything here is simulated and saved in this browser.', 'muted'); break;
      case 'pwd': add(cwd); break;
      case 'whoami': add('learner'); break;
      case 'hostname': add('ubuntu-learning'); break;
      case 'date': add(clock.toString()); break;
      case 'clear': setTerminalHistory([]); return;
      case 'ls': {
        const pathArg = args.find((arg) => !arg.startsWith('-'));
        const target = pathArg ? targetFor(pathArg) : cwd; const item = fs[target];
        if (!item) add(`ls: cannot access '${pathArg}': No such file or directory`, 'error');
        else if (item.type !== 'dir') add(pathArg);
        else {
          const names = [...item.children];
          if (args.some((arg) => arg.includes('a'))) names.unshift('.', '..');
          add(names.length ? names.map((name) => fs[normalize(`${target}/${name}`)]?.type === 'dir' ? `${name}/` : name).join('    ') : '(empty directory)', names.length ? 'normal' : 'muted');
        } break;
      }
      case 'cd': {
        const arg = args[0] || '/home/learner'; const target = arg === '~' ? '/home/learner' : targetFor(arg);
        if (!fs[target]) add(`bash: cd: ${arg}: No such file or directory`, 'error');
        else if (fs[target].type !== 'dir') add(`bash: cd: ${arg}: Not a directory`, 'error');
        else { setCwd(target); setFilesPath(target); }
        break;
      }
      case 'cat': {
        if (!args[0]) add('Usage: cat <file>', 'error');
        else { const file = fs[targetFor(args[0])];
          if (!file) add(`cat: ${args[0]}: No such file or directory`, 'error');
          else if (file.type === 'dir') add(`cat: ${args[0]}: Is a directory`, 'error');
          else (file.content || '').split('\n').forEach((line) => add(line || ' '));
        } break;
      }
      case 'mkdir': case 'touch': {
        if (!args[0]) { add(`Usage: ${cmd} <name>`, 'error'); break; }
        let next = fs; let made = 0;
        args.forEach((name) => {
          const path = targetFor(name);
          if (next[path]) add(`${cmd}: cannot create '${name}': File exists`, 'error');
          else if (!next[normalize(`${path}/..`)] || next[normalize(`${path}/..`)].type !== 'dir') add(`${cmd}: cannot create '${name}': No such directory`, 'error');
          else {
            const parent = normalize(`${path}/..`); const leaf = basename(path);
            next = { ...next, [path]: cmd === 'mkdir' ? { type: 'dir', children: [] } : { type: 'file', content: '' }, [parent]: { ...next[parent], children: [...next[parent].children, leaf] } }; made += 1;
          }
        });
        if (made) { setFs(next); add(`Created ${made === 1 ? args[0] : `${made} items`}.`, 'success'); }
        break;
      }
      case 'mv': {
        if (args.length < 2) { add('Usage: mv <source> <destination>', 'error'); break; }
        const source = targetFor(args[0]); const destination = targetFor(args[1]); const item = fs[source];
        if (!item) add(`mv: cannot stat '${args[0]}': No such file or directory`, 'error');
        else if (fs[destination]) add(`mv: cannot move to '${args[1]}': File exists`, 'error');
        else {
          const sourceParent = normalize(`${source}/..`); const destinationParent = normalize(`${destination}/..`);
          if (!fs[destinationParent] || fs[destinationParent].type !== 'dir') add(`mv: cannot move to '${args[1]}': No such directory`, 'error');
          else if (item.type === 'dir' && destination.startsWith(`${source}/`)) add('mv: cannot move a directory into itself', 'error');
          else {
            setFs((old) => {
              const next = { ...old, [destination]: old[source], [sourceParent]: { ...old[sourceParent], children: old[sourceParent].children.filter((name) => name !== basename(source)) }, [destinationParent]: { ...old[destinationParent], children: [...old[destinationParent].children, basename(destination)] } };
              delete next[source];
              if (item.type === 'dir') Object.keys(old).forEach((path) => { if (path.startsWith(`${source}/`)) { const relocated = `${destination}${path.slice(source.length)}`; next[relocated] = old[path]; delete next[path]; } });
              return next;
            });
            add(`Moved ${args[0]} to ${args[1]}.`, 'success');
          }
        }
        break;
      }
      case 'cp': {
        if (args.length < 2) { add('Usage: cp <source> <destination>', 'error'); break; }
        const source = targetFor(args[0]); const destination = targetFor(args[1]); const item = fs[source];
        if (!item || item.type === 'dir') add(`cp: '${args[0]}' is not a file`, 'error');
        else if (fs[destination]) add(`cp: cannot create '${args[1]}': File exists`, 'error');
        else {
          const parent = normalize(`${destination}/..`);
          if (!fs[parent] || fs[parent].type !== 'dir') add(`cp: cannot create '${args[1]}': No such directory`, 'error');
          else { setFs((old) => ({ ...old, [destination]: { ...item }, [parent]: { ...old[parent], children: [...old[parent].children, basename(destination)] } })); add(`Copied ${args[0]} to ${args[1]}.`, 'success'); }
        }
        break;
      }
      case 'rmdir': {
        const path = args[0] ? targetFor(args[0]) : null; const dir = path && fs[path];
        if (!path) add('Usage: rmdir <directory>', 'error');
        else if (!dir || dir.type !== 'dir') add(`rmdir: failed to remove '${args[0]}': Not a directory`, 'error');
        else if (dir.children.length) add(`rmdir: failed to remove '${args[0]}': Directory not empty`, 'error');
        else { const parent = normalize(`${path}/..`); setFs((old) => { const next = { ...old }; delete next[path]; next[parent] = { ...next[parent], children: next[parent].children.filter((name) => name !== basename(path)) }; return next; }); add(`Removed directory ${args[0]}.`, 'success'); }
        break;
      }
      case 'rm': {
        const path = args[0] ? targetFor(args[0]) : null; const file = path && fs[path];
        if (!path) add('Usage: rm <file>', 'error');
        else if (!file) add(`rm: cannot remove '${args[0]}': No such file`, 'error');
        else if (path === '/home/learner/.Trash' || path.startsWith('/home/learner/.Trash/')) add('rm: items in Trash cannot be removed again from this demo', 'error');
        else { let trashName = basename(path); let suffix = 1; while (fs[normalize(`/home/learner/.Trash/${trashName}`)]) trashName = `${basename(path)} (${suffix++})`; const trashPath = normalize(`/home/learner/.Trash/${trashName}`); const parent = normalize(`${path}/..`); setFs((old) => { const next = { ...old, [trashPath]: { ...old[path], trashedFrom: path }, [parent]: { ...old[parent], children: old[parent].children.filter((name) => name !== basename(path)) }, '/home/learner/.Trash': { ...old['/home/learner/.Trash'], children: [...old['/home/learner/.Trash'].children, trashName] } }; delete next[path]; if (old[path].type === 'dir') Object.keys(old).forEach((child) => { if (child.startsWith(`${path}/`)) { const moved = `${trashPath}${child.slice(path.length)}`; next[moved] = old[child]; delete next[child]; } }); return next; }); add(`Moved ${args[0]} to Trash.`, 'success'); }
        break;
      }
      case 'echo': add(args.join(' ')); break;
      case 'tree': {
        const start = args[0] ? targetFor(args[0]) : cwd;
        if (!fs[start]) add(`tree: ${args[0]}: No such file or directory`, 'error');
        else { add(displayPath(start)); const walk = (path, prefix = '') => (fs[path]?.children || []).forEach((name, index, list) => { const child = normalize(`${path}/${name}`); const last = index === list.length - 1; add(`${prefix}${last ? '└── ' : '├── '}${name}${fs[child]?.type === 'dir' ? '/' : ''}`); if (fs[child]?.type === 'dir') walk(child, `${prefix}${last ? '    ' : '│   '}`); }); walk(start); }
        break;
      }
      case 'sudo': add('sudo is disabled in this safe learning sandbox.', 'error'); break;
      case '': break;
      default: add(`bash: ${cmd}: command not found. Type help to see available commands.`, 'error');
    }
    setTerminalHistory((old) => [...old, ...out]);
  };

  const apps = [
    { name: 'Files', icon: <Folder fill="currentColor" />, color: 'orange', id: 'files' },
    { name: 'Terminal', icon: <TerminalIcon />, color: 'terminal', id: 'terminal' },
    { name: 'Learning Center', icon: <BookOpen />, color: 'learning', id: 'academy' },
    { name: 'Cloud', icon: <Cloud />, color: 'cloud-app', id: 'cloud' },
    { name: 'DevOps', icon: <GitBranch />, color: 'devops-app', id: 'devops' },
    { name: 'Text Editor', icon: <FileText />, color: 'editor', id: 'editor' },
    { name: 'Settings', icon: <Settings />, color: 'settings', id: 'settings' },
    { name: 'Web Browser', icon: <Network />, color: 'browser', id: 'browser' },
    { name: 'Help', icon: <CircleHelp />, color: 'help', id: 'help' },
  ];
  const launchApp = (id) => {
    setAppsOpen(false);
    if (id === 'cloud') { openCloudLab(); return; }
    if (id === 'devops') { openLearning(id); return; }
    if (id === 'settings') { setSettingsOpen(true); return; }
    if (id === 'browser') { notify('Browser is not connected in this demo'); return; }
    if (id === 'editor' || id === 'help') { notify(id === 'editor' ? 'Select a text file in Files to open it.' : 'Try Terminal commands: ls, cd, pwd, cat.'); return; }
    openWindow(id);
  };
  const openLearning = (trackId = 'linux') => {
    setAcademyTrack(trackId);
    setSelectedLesson(0);
    setCloudLabTab('lessons');
    openWindow('academy');
  };
  const openCloudLab = () => {
    setAcademyTrack('cloud');
    setLabProvider('aws');
    setCloudLabTab('lab');
    openWindow('academy');
  };
  const markLessonComplete = (trackId, index) => {
    const key = `${trackId}:${index}`;
    setCompletedLessons((old) => old.includes(key) ? old : [...old, key]);
    notify('Lesson marked complete');
  };
  const openFile = (entry) => {
    if (entry.item?.type === 'dir') { changeFolder(entry.path); return; }
    setSelectedFile(entry.name);
    if (/\.(txt|md|sh|js|jsx|py|html|css)$/i.test(entry.name)) setActiveApp('editor');
    else notify(`Opened ${entry.name}`);
  };

  const pathParts = filesPath.split('/').filter(Boolean);
  const pathCrumbs = [{ name: 'Home', path: '/home/learner' }];
  let crumbPath = '';
  pathParts.slice(pathParts[0] === 'home' && pathParts[1] === 'learner' ? 2 : 0).forEach((part) => { crumbPath += `/${part}`; pathCrumbs.push({ name: part, path: crumbPath }); });
  const selectedPath = selectedFile ? normalize(`${filesPath}/${selectedFile}`) : null;
  const editorFile = activeApp === 'editor' && selectedPath && fs[selectedPath]?.type === 'file' ? fs[selectedPath] : null;
  const desktopDate = clock.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const desktopTime = clock.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={`desktop ${!activeApp ? 'home-mode' : ''}`} onContextMenu={(event) => { if (event.target === event.currentTarget) { event.preventDefault(); setAppsOpen((open) => !open); } }}>
      <header className="top-panel">
        <button className={`top-activities ${appsOpen ? 'active' : ''}`} onClick={() => setAppsOpen((open) => !open)}><LayoutGrid size={14} /> Activities</button>
        <button className="top-app-name" onClick={() => activeApp ? setAppsOpen((open) => !open) : openWindow('files')}>{apps.find((item) => item.id === activeApp)?.name || 'Desktop'} <ChevronDown size={13} /></button>
        <button className="top-clock" onClick={() => notify(`${desktopDate} · ${desktopTime}`)}>{desktopDate} &nbsp;{desktopTime}</button>
        <div className="system-tray"><button aria-label="Network"><Wifi size={15} /></button><button aria-label="Volume"><Activity size={14} /></button><button aria-label="Battery"><Battery size={16} /></button><button className="tray-toggle" onClick={() => setSettingsOpen((open) => !open)} aria-label="System menu"><ChevronDown size={14} /></button></div>
      </header>

      <nav className="dock" aria-label="Applications">
        {apps.slice(0, 7).map((app) => <button key={app.id} className={`dock-icon ${app.color} ${activeApp === app.id && !appsOpen ? 'running' : ''} ${minimizedApps.includes(app.id) ? 'minimized' : ''}`} title={minimizedApps.includes(app.id) ? `Restore ${app.name}` : app.name} aria-label={app.name} onClick={() => activeApp === app.id ? minimizeWindow() : launchApp(app.id)}>{app.icon}</button>)}
        <span className="dock-separator" />
        <button className={`dock-icon show-apps ${appsOpen ? 'running' : ''}`} title="Show Applications" aria-label="Show Applications" onClick={() => setAppsOpen((open) => !open)}><LayoutGrid /></button>
      </nav>

      {activeApp && <main className={`window ${windowMax ? 'maximized' : ''}`}>
        <div className="window-titlebar">
        <div className="window-controls"><button title="Close and return to Home" aria-label="Close and return to Home" onClick={closeToHome}><X size={12} /></button><button title="Minimize" aria-label="Minimize" onClick={minimizeWindow}><Minus size={12} /></button><button title={windowMax ? 'Restore' : 'Maximize'} aria-label={windowMax ? 'Restore window' : 'Maximize window'} onClick={() => setWindowMax((value) => !value)}><Maximize2 size={11} /></button></div>
          <strong>{activeApp === 'files' ? 'Files' : activeApp === 'terminal' ? 'learner@ubuntu: terminal' : activeApp === 'editor' ? selectedFile || 'Text Editor' : activeApp === 'academy' ? 'Learning Center' : 'Ubuntu Learning Desktop'}</strong>
          <button className="title-more" aria-label="Window options" onClick={() => notify('Ubuntu Learning Desktop · simulated environment')}><MoreHorizontal size={18} /></button>
        </div>

        {activeApp === 'files' && <div className="files-window">
          <aside className="files-sidebar">
            <div className="file-sidebar-section"><div className="file-sidebar-label">Places</div>
              {[['Recent', <Clock3 size={17} />, '/home/learner'], ['Starred', <span className="star-icon">★</span>, '/home/learner'], ['Home', <Home size={17} />, '/home/learner'], ['Documents', <FileText size={17} />, '/home/learner/Documents'], ['Downloads', <HardDrive size={17} />, '/home/learner/Downloads'], ['Pictures', <Image size={17} />, '/home/learner/Pictures'], ['Music', <Music2 size={17} />, '/home/learner/Music'], ['Videos', <Computer size={17} />, '/home/learner/Videos']].map(([label, icon, path]) => <button key={label} className={`place-link ${filesPath === path ? 'selected' : ''}`} onClick={() => changeFolder(path)}>{icon}<span>{label}</span></button>)}
            </div>
            <div className="file-sidebar-section devices-section"><div className="file-sidebar-label">Devices</div><button className="place-link" onClick={() => changeFolder('/')}><HardDrive size={17} /><span>Computer</span></button><div className="disk-space"><span /></div><small>18.4 GB free</small></div>
            <button className={`trash-link ${trashOpen ? 'selected' : ''}`} onClick={() => changeFolder('/home/learner/.Trash')}><Trash2 size={16} /> Trash</button>
          </aside>
          <section className="file-content">
            <div className="file-toolbar">
              <div className="nav-arrows"><button title="Go back" onClick={() => pathCrumbs.length > 1 && changeFolder(pathCrumbs.at(-2).path)}><ChevronLeft size={18} /></button><button title="Go forward" onClick={() => changeFolder('/home/learner')}><ChevronRight size={18} /></button></div>
              <div className="breadcrumbs">{pathCrumbs.map((crumb, index) => <span key={crumb.path} className="crumb-wrap">{index > 0 && <ChevronRight size={13} />}<button className={index === pathCrumbs.length - 1 ? 'current' : ''} onClick={() => changeFolder(crumb.path)}>{crumb.name}</button></span>)}</div>
              <label className="file-search"><Search size={15} /><input placeholder="Search" value={fileQuery} onChange={(event) => setFileQuery(event.target.value)} /></label>
              <div className="view-toggle"><button className={viewMode === 'list' ? 'selected' : ''} title="List view" onClick={() => setViewMode('list')}><List size={16} /></button><button className={viewMode === 'grid' ? 'selected' : ''} title="Grid view" onClick={() => setViewMode('grid')}><LayoutGrid size={15} /></button></div>
              <button className="toolbar-menu" title="More options" aria-expanded={fileMenuOpen} onClick={() => setFileMenuOpen((open) => !open)}><MoreHorizontal size={19} /></button>
              {fileMenuOpen && <div className="file-menu" role="menu"><button role="menuitem" onClick={() => { setViewMode('grid'); setFileMenuOpen(false); }}>Icon view</button><button role="menuitem" onClick={() => { setViewMode('list'); setFileMenuOpen(false); }}>List view</button><button role="menuitem" disabled={!selectedFile} onClick={() => { setFileMenuOpen(false); renameSelected(); }}>Rename selected… <span>F2</span></button><button role="menuitem" disabled={!selectedFile} onClick={() => { setFileMenuOpen(false); deleteSelected(); }}>Move to Trash <span>Delete</span></button><div className="file-menu-divider" /><button role="menuitem" onClick={() => { setFileMenuOpen(false); notify('Files are saved in browser storage on this device'); }}>About Files</button></div>}
            </div>
            <div className="file-actions">{trashOpen ? <button disabled={!selectedFile} onClick={restoreSelected}><FolderOpen size={15} /> Restore</button> : <><button onClick={() => createFile('dir')}><Plus size={15} /> New Folder</button><button onClick={() => createFile('file')}><File size={15} /> New Document</button><button className="rename-button" disabled={!selectedFile} onClick={renameSelected}>Rename</button></>}<span className="action-spacer" />{trashOpen ? <button className="rename-button" disabled={!entries.length} onClick={() => { setFs((old) => { const next = { ...old, '/home/learner/.Trash': { ...old['/home/learner/.Trash'], children: [] } }; old['/home/learner/.Trash'].children.forEach((name) => { const path = normalize(`/home/learner/.Trash/${name}`); delete next[path]; if (old[path]?.type === 'dir') Object.keys(old).forEach((child) => { if (child.startsWith(`${path}/`)) delete next[child]; }); }); return next; }); setSelectedFile(null); notify('Trash emptied'); }}>Empty Trash</button> : null}<button className="delete-button" disabled={!selectedFile || trashOpen} onClick={deleteSelected}><Trash2 size={15} /></button><span className="items-count">{entries.length} items</span></div>
            {entries.length ? <div className={`file-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {entries.map((entry) => <button key={entry.name} className={`file-item ${selectedFile === entry.name ? 'selected' : ''} ${entry.item?.type === 'dir' ? 'folder-item' : ''}`} onClick={() => setSelectedFile(entry.name)} onDoubleClick={() => openFile(entry)} onContextMenu={(event) => { event.preventDefault(); setSelectedFile(entry.name); }}>
                <span className="item-icon">{fileIcon(entry.name, entry.item?.type)}</span><span className="item-name">{entry.name}</span><span className="item-kind">{entry.item?.type === 'dir' ? 'Folder' : 'Text file'}</span><span className="item-modified">Today</span>
              </button>)}
            </div> : <div className="empty-folder"><FolderOpen size={48} strokeWidth={1.2} /><strong>{fileQuery ? 'No matching files' : 'This folder is empty'}</strong><span>{fileQuery ? 'Try a different search.' : 'Create a new folder or document to get started.'}</span></div>}
            <footer className="files-status"><span>{entries.length} items</span><span>{selectedFile ? `${selectedFile} selected` : 'Select items to see more information'}</span></footer>
          </section>
        </div>}

        {activeApp === 'terminal' && <section className="terminal-app">
          <div className="terminal-tabs"><span className="terminal-tab"><TerminalIcon size={14} /> learner@ubuntu: {displayPath(cwd)}<button title="Close terminal and return Home" onClick={closeToHome}><X size={12} /></button></span><button className="new-terminal" title="New terminal" onClick={() => setTerminalHistory((old) => [...old, { text: '', kind: 'normal' }])}><Plus size={15} /></button></div>
          <div className="terminal-body" ref={terminalRef} onClick={() => commandRef.current?.focus()}>{terminalHistory.map((line, index) => <div key={`${index}-${line.text}`} className={`terminal-line ${line.kind}`}>{line.text || '\u00a0'}</div>)}<form className="terminal-prompt" onSubmit={(event) => { event.preventDefault(); runCommand(command); setCommand(''); }}><span className="prompt-user">learner@ubuntu</span>:<span className="prompt-path">{displayPath(cwd)}</span>$ <input ref={commandRef} value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => { if (event.key === 'ArrowUp') { event.preventDefault(); if (historyIndex.current > 0) setCommand(history.current[--historyIndex.current]); } if (event.key === 'ArrowDown') { event.preventDefault(); if (historyIndex.current < history.current.length - 1) setCommand(history.current[++historyIndex.current]); else { historyIndex.current = history.current.length; setCommand(''); } } }} autoComplete="off" spellCheck="false" aria-label="Enter a Linux command" /></form></div>
          <div className="terminal-bottom"><span><ShieldCheck size={13} /> Simulated environment · changes stay in this browser</span><span><kbd>↑</kbd> history</span></div>
        </section>}

        {activeApp === 'editor' && <section className="editor-app">
          <div className="editor-toolbar"><FileText size={17} /><span>{selectedFile || 'No document selected'}</span><span className="action-spacer" />{editorFile && <button onClick={() => notify('Changes are saved automatically')}><ShieldCheck size={14} /> Saved locally</button>}</div>
          {editorFile ? <textarea key={selectedPath} defaultValue={editorFile.content || ''} onChange={(event) => setFs((old) => ({ ...old, [selectedPath]: { ...old[selectedPath], content: event.target.value } }))} spellCheck="false" aria-label={`Edit ${selectedFile}`} /> : <div className="empty-folder"><FileText size={44} /><strong>Choose a text document</strong><span>Open a .txt, .md, .sh, or source file in Files to edit it.</span><button className="primary-button" onClick={() => setActiveApp('files')}>Open Files</button></div>}
        </section>}

        {activeApp === 'academy' && (() => {
          const track = learningTracks.find((item) => item.id === academyTrack) || learningTracks[0];
          const lesson = track.lessons[selectedLesson] || track.lessons[0];
          const lessonKey = `${track.id}:${selectedLesson}`;
          const trackComplete = track.lessons.filter((_, index) => completedLessons.includes(`${track.id}:${index}`)).length;
          return <section className="academy-app">
            <aside className="academy-sidebar"><div className="academy-side-label">LEARNING PATHS</div>{learningTracks.map((item) => <button key={item.id} className={`academy-nav ${track.id === item.id ? 'selected' : ''}`} onClick={() => { setAcademyTrack(item.id); setSelectedLesson(0); setCloudLabTab('lessons'); }}><span className={`academy-nav-icon ${item.color}`}>{item.icon}</span><span>{item.title}</span><small>{item.lessons.filter((_, index) => completedLessons.includes(`${item.id}:${index}`)).length}/{item.lessons.length}</small></button>)}<div className="academy-side-note"><ShieldCheck size={16} /><span>Learn with safe, guided examples. Cloud labs are simulated and never connect to paid accounts.</span></div></aside>
            <div className="academy-content"><div className="academy-heading"><div><div className="eyebrow">{track.level} PATH</div><h2>{track.title}</h2><p>{track.subtitle}</p>{track.tools && <div className="tool-pills" aria-label="Topics and tools">{track.tools.map((tool) => <span key={tool}>{tool}</span>)}</div>}</div><div className="track-progress"><span>{trackComplete} of {track.lessons.length} lessons</span><div><i style={{ width: `${(trackComplete / track.lessons.length) * 100}%` }} /></div></div></div>
              {['cloud', 'aws', 'azure', 'gcp'].includes(track.id) && <div className="academy-tabs"><button className={cloudLabTab === 'lessons' ? 'selected' : ''} onClick={() => setCloudLabTab('lessons')}><BookOpen size={14} /> Lessons</button><button className={cloudLabTab === 'lab' ? 'selected' : ''} onClick={() => setCloudLabTab('lab')}><LockKeyhole size={14} /> Cloud Lab</button></div>}
              {['cloud', 'aws', 'azure', 'gcp'].includes(track.id) && cloudLabTab === 'lab' ? <CloudLab providerId={track.id === 'cloud' ? labProvider : track.id} onProviderChange={(id) => { setLabProvider(id); setAcademyTrack(id); setSelectedLesson(0); }} /> : <div className="lesson-layout"><nav className="lesson-list" aria-label={`${track.title} lessons`}>{track.lessons.map(([title], index) => <button key={title} className={`lesson-nav ${index === selectedLesson ? 'selected' : ''}`} onClick={() => setSelectedLesson(index)}><span className={`lesson-check ${completedLessons.includes(`${track.id}:${index}`) ? 'done' : ''}`}>{completedLessons.includes(`${track.id}:${index}`) ? '✓' : String(index + 1).padStart(2, '0')}</span><span>{title}</span></button>)}</nav>
                <article className="lesson-detail"><div className={`lesson-banner ${track.color}`}><div className="lesson-banner-icon">{track.icon}</div><span>{track.title} · LESSON {String(selectedLesson + 1).padStart(2, '0')}</span></div><div className="lesson-detail-body"><div className="lesson-kicker">LESSON {String(selectedLesson + 1).padStart(2, '0')} / {String(track.lessons.length).padStart(2, '0')}</div><h3>{lesson[0]}</h3><p>{lesson[1]}</p><div className="lesson-example"><div><Code2 size={15} /> PRACTICE</div><p>{lesson[2]}</p>{track.id === 'linux' && <button onClick={() => { setCommand(lesson[3]); openWindow('terminal'); }}>Try in Terminal <TerminalIcon size={14} /></button>}</div><div className="lesson-actions"><span>{completedLessons.includes(lessonKey) ? 'Completed' : 'About 8 minutes'}</span><button className={completedLessons.includes(lessonKey) ? 'completed' : ''} onClick={() => markLessonComplete(track.id, selectedLesson)}>{completedLessons.includes(lessonKey) ? '✓ Completed' : 'Mark complete'}</button>{selectedLesson < track.lessons.length - 1 && <button className="next-lesson" onClick={() => setSelectedLesson((index) => index + 1)}>Next lesson <ChevronRight size={15} /></button>}</div></div></article>
              </div>}
            </div>
          </section>;
        })()}

      </main>}

      <div className="desktop-note"><ShieldCheck size={14} /> Practice changes are saved locally in your browser</div>

      {appsOpen && <div className="app-overview">
        <div className="overview-search"><Search size={17} /><span>Type to search…</span></div>
        <div className="app-grid">{apps.map((app) => <button key={app.id} className="app-tile" onClick={() => launchApp(app.id)}><span className={`app-tile-icon ${app.color}`}>{app.icon}</span><span>{app.name}</span></button>)}</div>
        <button className="overview-dots" aria-label="Page 1"><span /><span /><span /></button>
      </div>}

      {settingsOpen && <div className="quick-settings" role="dialog" aria-label="System menu"><div className="settings-header"><strong>Quick Settings</strong><button onClick={() => setSettingsOpen(false)}><X size={15} /></button></div><div className="settings-toggles"><button className="on"><Wifi size={17} /><span>Wi-Fi</span></button><button className="on"><Network size={17} /><span>Network</span></button><button><Power size={17} /><span>Power</span></button></div><div className="settings-footer"><span>Ubuntu Learning Desktop</span><button onClick={() => { setSettingsOpen(false); notify('Settings are simulated in this demo'); }}><Settings size={16} /></button></div></div>}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default App;
