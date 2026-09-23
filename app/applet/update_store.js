const fs = require('fs');
let content = fs.readFileSync('src/services/unifiedStore.ts', 'utf8');

// 1. In createManufacturerShipment
const target1 = 'this.shipments.unshift(newShipment);';
const replacement1 = `this.shipments.unshift(newShipment);
    this.supplyChainNotifications.unshift({
      notificationId: \`NOTIF-\${Math.floor(1000 + Math.random() * 9000)}\`,
      recipientOrg: data.wholesaler,
      recipientRole: 'Wholesaler',
      type: 'NEW_SHIPMENT',
      title: 'New shipment dispatched to you',
      message: \`Consignment of \${data.quantity} units of \${data.medicineName} (Batch: \${data.batchNumber}) dispatched by \${data.manufacturer}. Required action: Receive & Verify.\`,
      shipmentId,
      batchId: data.batchNumber,
      medicineId: \`MED-\${data.batchNumber}\`,
      sourceOrg: data.manufacturer,
      sourceRole: 'Manufacturer',
      createdAt: timestamp,
      readAt: null,
      actionedAt: null,
      status: 'CREATED',
      priority: 'high',
      relatedRoute: 'wholesaler',
    });`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log('Replaced createManufacturerShipment notification successfully');
} else {
  console.log('Target 1 not found');
}

// 2. In receiveWholesalerShipment
const target2 = `  public receiveWholesalerShipment(
    shipmentId: string,
    wholesalerName: string,
    depotLocation: string,
    recordedTemp: number
  ) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const shp = this.shipments.find((s) => s.id === shipmentId);`;

const replacement2 = `  public receiveWholesalerShipment(
    shipmentId: string,
    wholesalerName: string,
    depotLocation: string,
    recordedTemp: number
  ) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const shp = this.shipments.find((s) => s.id === shipmentId);
    const relatedNotif = this.supplyChainNotifications.find((n) => n.shipmentId === shipmentId && n.status !== 'ACTIONED');
    if (relatedNotif) {
      relatedNotif.status = 'ACTIONED';
      relatedNotif.actionedAt = timestamp;
      relatedNotif.readAt = relatedNotif.readAt || timestamp;
    }`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log('Replaced receiveWholesalerShipment successfully');
} else {
  console.log('Target 2 not found');
}

// 3. In dispatchWholesalerShipment
const target3 = 'this.shipments.unshift(childShipment);';
const replacement3 = `this.shipments.unshift(childShipment);
    this.supplyChainNotifications.unshift({
      notificationId: \`NOTIF-\${Math.floor(1000 + Math.random() * 9000)}\`,
      recipientOrg: data.pharmacistName,
      recipientRole: 'Pharmacist',
      type: 'NEW_SHIPMENT',
      title: 'New medicine shipment dispatched to your pharmacy',
      message: \`Consignment of \${requestedQty} units of \${parentShp.medicineName} (Batch: \${parentShp.batchNumber}) dispatched by \${data.wholesalerName}. Required action: Receive & Verify.\`,
      shipmentId: childShipmentId,
      batchId: parentShp.batchNumber,
      medicineId: \`MED-\${parentShp.batchNumber}\`,
      sourceOrg: data.wholesalerName,
      sourceRole: 'Wholesaler',
      createdAt: timestamp,
      readAt: null,
      actionedAt: null,
      status: 'CREATED',
      priority: 'high',
      relatedRoute: 'pharmacist',
    });`;

if (content.includes(target3)) {
  content = content.replace(target3, replacement3);
  console.log('Replaced dispatchWholesalerShipment successfully');
} else {
  console.log('Target 3 not found');
}

// 4. In receivePharmacistShipment
const target4 = `  public receivePharmacistShipment(
    shipmentId: string,
    pharmacistName: string,
    pharmacyLocation: string,
    actualReceivedQty?: number,
    discrepancyReason?: string
  ) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const shp = this.shipments.find((s) => s.id === shipmentId);`;

const replacement4 = `  public receivePharmacistShipment(
    shipmentId: string,
    pharmacistName: string,
    pharmacyLocation: string,
    actualReceivedQty?: number,
    discrepancyReason?: string
  ) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const shp = this.shipments.find((s) => s.id === shipmentId);
    const relatedNotif = this.supplyChainNotifications.find((n) => n.shipmentId === shipmentId && n.status !== 'ACTIONED');
    if (relatedNotif) {
      relatedNotif.status = 'ACTIONED';
      relatedNotif.actionedAt = timestamp;
      relatedNotif.readAt = relatedNotif.readAt || timestamp;
    }`;

if (content.includes(target4)) {
  content = content.replace(target4, replacement4);
  console.log('Replaced receivePharmacistShipment successfully');
} else {
  console.log('Target 4 not found');
}

// 5. In resetDemoData
const target5 = 'this.scanSessions = [];';
const replacement5 = `this.scanSessions = [];
    this.supplyChainNotifications = [...INITIAL_SUPPLY_CHAIN_NOTIFICATIONS];`;

if (content.includes(target5)) {
  content = content.replace(target5, replacement5);
  console.log('Replaced resetDemoData successfully');
} else {
  console.log('Target 5 not found');
}

fs.writeFileSync('src/services/unifiedStore.ts', content, 'utf8');
console.log('unifiedStore.ts updated successfully.');
