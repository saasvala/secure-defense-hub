import { store, genId, type Role, type Program, type Project, type Prototype, type FieldTest, type Asset, type InventoryItem, type Clearance } from './store';

const DEFAULT_ROLES: Role[] = [
  { id: genId(), name: 'Super Admin' },
  { id: genId(), name: 'Defense Director' },
  { id: genId(), name: 'Program Commander' },
  { id: genId(), name: 'Lead Scientist' },
  { id: genId(), name: 'Weapons Systems Engineer' },
  { id: genId(), name: 'Aerospace Engineer' },
  { id: genId(), name: 'Cyber Security Analyst' },
  { id: genId(), name: 'Field Testing Officer' },
  { id: genId(), name: 'Quality & Compliance Officer' },
  { id: genId(), name: 'Logistics Manager' },
  { id: genId(), name: 'Finance' },
  { id: genId(), name: 'External Auditor' },
];

export function seedData() {
  // Seed/merge roles — ensure all default roles exist (do not overwrite existing ones)
  const existingRoles = store.getRoles();
  const existingNames = new Set(existingRoles.map(r => r.name));
  const missing = DEFAULT_ROLES.filter(r => !existingNames.has(r.name));
  if (missing.length > 0) {
    store.setRoles([...existingRoles, ...missing]);
  }

  const roles = store.getRoles();
  const getRoleId = (name: string) => roles.find(r => r.name === name)?.id || roles[0].id;

  // Seed programs
  if (store.getPrograms().length === 0) {
    const programs: Program[] = [
      { id: genId(), name: 'Project AEGIS Shield', classification: 'TOP SECRET', status: 'active', created_by: 'system', created_at: '2024-01-15' },
      { id: genId(), name: 'Operation Thunderbolt', classification: 'SECRET', status: 'active', created_by: 'system', created_at: '2024-03-01' },
      { id: genId(), name: 'Quantum Defense Initiative', classification: 'TOP SECRET', status: 'active', created_by: 'system', created_at: '2024-05-10' },
      { id: genId(), name: 'Cyber Fortress Program', classification: 'CONFIDENTIAL', status: 'active', created_by: 'system', created_at: '2024-02-20' },
      { id: genId(), name: 'Aerial Dominance R&D', classification: 'SECRET', status: 'suspended', created_by: 'system', created_at: '2023-11-05' },
      { id: genId(), name: 'Maritime Sentinel', classification: 'CONFIDENTIAL', status: 'completed', created_by: 'system', created_at: '2023-06-14' },
    ];
    store.setPrograms(programs);
  }

  // Seed projects
  if (store.getProjects().length === 0) {
    const programs = store.getPrograms();
    const projects: Project[] = [
      { id: genId(), program_id: programs[0].id, code_name: 'TITAN-7', status: 'in_progress', description: 'Advanced missile defense array', created_at: '2024-02-01' },
      { id: genId(), program_id: programs[0].id, code_name: 'VALKYRIE', status: 'testing', description: 'Next-gen interceptor system', created_at: '2024-04-15' },
      { id: genId(), program_id: programs[1].id, code_name: 'STORM-X', status: 'planning', description: 'EMP hardening research', created_at: '2024-06-01' },
      { id: genId(), program_id: programs[2].id, code_name: 'QUBIT-1', status: 'in_progress', description: 'Quantum encryption module', created_at: '2024-07-01' },
      { id: genId(), program_id: programs[3].id, code_name: 'FIREWALL-9', status: 'in_progress', description: 'AI-driven threat detection', created_at: '2024-03-10' },
      { id: genId(), program_id: programs[4].id, code_name: 'RAPTOR-II', status: 'testing', description: 'Stealth UAV prototype', created_at: '2024-01-20' },
    ];
    store.setProjects(projects);
  }

  // Seed prototypes
  if (store.getPrototypes().length === 0) {
    const projects = store.getProjects();
    const prototypes: Prototype[] = [
      { id: genId(), project_id: projects[0].id, version: 'v1.0-alpha', result: 'pass', notes: 'Initial stress test passed', created_at: '2024-03-01' },
      { id: genId(), project_id: projects[0].id, version: 'v1.1-beta', result: 'review', notes: 'Thermal analysis pending', created_at: '2024-05-15' },
      { id: genId(), project_id: projects[1].id, version: 'v0.9', result: 'fail', notes: 'Guidance recalibration needed', created_at: '2024-06-01' },
      { id: genId(), project_id: projects[3].id, version: 'v2.0', result: 'pass', notes: 'Encryption benchmark exceeded', created_at: '2024-08-01' },
    ];
    store.setPrototypes(prototypes);
  }

  // Seed field tests
  if (store.getFieldTests().length === 0) {
    const projects = store.getProjects();
    const tests: FieldTest[] = [
      { id: genId(), project_id: projects[0].id, location: 'Site Alpha - Desert Range', outcome: 'success', date: '2024-04-10', notes: 'Full operational test complete' },
      { id: genId(), project_id: projects[1].id, location: 'Naval Base Omega', outcome: 'partial', date: '2024-07-20', notes: 'Range limited in adverse weather' },
      { id: genId(), project_id: projects[5].id, location: 'Airfield Bravo', outcome: 'success', date: '2024-02-28', notes: 'Stealth signature within parameters' },
      { id: genId(), project_id: projects[4].id, location: 'Cyber Lab Delta', outcome: 'pending', date: '2024-09-01', notes: 'Penetration testing scheduled' },
    ];
    store.setFieldTests(tests);
  }

  // Seed assets
  if (store.getAssets().length === 0) {
    const assets: Asset[] = [
      { id: genId(), name: 'Radar Array MK-IV', type: 'Equipment', status: 'operational' },
      { id: genId(), name: 'Quantum Processor Unit', type: 'Computing', status: 'operational' },
      { id: genId(), name: 'Stealth Coating Lab', type: 'Facility', status: 'operational' },
      { id: genId(), name: 'EMP Test Chamber', type: 'Facility', status: 'maintenance' },
      { id: genId(), name: 'UAV Fleet - Series R', type: 'Vehicle', status: 'operational' },
      { id: genId(), name: 'Encrypted Comm Unit X7', type: 'Equipment', status: 'operational' },
      { id: genId(), name: 'Ballistic Test Range', type: 'Facility', status: 'operational' },
      { id: genId(), name: 'Legacy Mainframe C12', type: 'Computing', status: 'decommissioned' },
    ];
    store.setAssets(assets);
  }

  // Seed inventory
  if (store.getInventory().length === 0) {
    const assets = store.getAssets();
    const inventory: InventoryItem[] = assets.map(a => ({
      id: genId(),
      asset_id: a.id,
      qty: Math.floor(Math.random() * 50) + 1,
      location: ['Hangar A', 'Lab B', 'Warehouse C', 'Vault D', 'Site E'][Math.floor(Math.random() * 5)],
    }));
    store.setInventory(inventory);
  }

  // Seed dummy users (non-admin)
  const ROLE_BY_USERNAME: Record<string, string> = {
    director_hawk: 'Defense Director',
    cmd_falcon: 'Program Commander',
    sci_nova: 'Lead Scientist',
    eng_strike: 'Weapons Systems Engineer',
    cyber_shield: 'Cyber Security Analyst',
    fto_range: 'Field Testing Officer',
    audit_ext: 'External Auditor',
  };
  const superAdminId = getRoleId('Super Admin');

  // NOTE: Super Admin account is NOT auto-seeded. It must be created by the
  // user via the Setup screen after license activation (first-time flow).

  const allUsers = store.getUsers();
  // Repair previously mis-seeded users (everyone showing Super Admin)
  let needsRepair = false;
  const repaired = allUsers.map(u => {
    const expected = ROLE_BY_USERNAME[u.username];
    if (expected && u.role_id === superAdminId) {
      needsRepair = true;
      return { ...u, role_id: getRoleId(expected) };
    }
    return u;
  });
  if (needsRepair) store.setUsers(repaired);

  if (store.getUsers().length <= 1) {
    const existingUsers = store.getUsers();
    const dummyUsers = [
      { id: genId(), role_id: getRoleId('Defense Director'), username: 'director_hawk', password: 'dir2024!', status: 'active' as const },
      { id: genId(), role_id: getRoleId('Program Commander'), username: 'cmd_falcon', password: 'cmd2024!', status: 'active' as const },
      { id: genId(), role_id: getRoleId('Lead Scientist'), username: 'sci_nova', password: 'sci2024!', status: 'active' as const },
      { id: genId(), role_id: getRoleId('Weapons Systems Engineer'), username: 'eng_strike', password: 'eng2024!', status: 'active' as const },
      { id: genId(), role_id: getRoleId('Cyber Security Analyst'), username: 'cyber_shield', password: 'cyb2024!', status: 'active' as const },
      { id: genId(), role_id: getRoleId('Field Testing Officer'), username: 'fto_range', password: 'fto2024!', status: 'active' as const },
      { id: genId(), role_id: getRoleId('External Auditor'), username: 'audit_ext', password: 'aud2024!', status: 'active' as const },
    ];
    store.setUsers([...existingUsers, ...dummyUsers]);
  }

  // Seed clearances
  if (store.getClearances().length === 0) {
    const users = store.getUsers();
    const clearances: Clearance[] = users.map(u => ({
      id: genId(),
      user_id: u.id,
      level: (['TOP SECRET', 'SECRET', 'CONFIDENTIAL', 'UNCLASSIFIED'] as const)[Math.floor(Math.random() * 4)],
      expiry: '2025-12-31',
    }));
    store.setClearances(clearances);
  }
}
