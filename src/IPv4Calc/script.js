// Update the slider number and Calculate everything on slider move

let rangeslider = document.getElementById("smInput");
let output = document.getElementById("smDisplay");

rangeslider.oninput = function () {
    document.getElementById("smDisplay").innerHTML = "Subnet Mask: " + createNetmaskAddr(rangeslider.value);
    document.getElementById("CIDR").innerHTML = "CIDR Notation: /" + this.value;
    ValidateForm();
}

// Check if input is valid IPv4 Address

function ValidateForm() {
    function validateIPv4(ip) {
        const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
        return ipv4Regex.test(ip);
    }

    if (validateIPv4(document.getElementById('ipInput').value)) {
        CalculateIPv4();
    } else {
        document.getElementById("Result").innerHTML = "<tr><td>Please enter a valid IP Addresss</td></tr>"; 
    }
}

// Convert CIDR  into Decimal 

function createNetmaskAddr(bitCount) {
    var mask = [], i, n;
    for(i=0; i<4; i++) {
      n = Math.min(bitCount, 8);
      mask.push(256 - Math.pow(2, 8-n));
      bitCount -= n;
    }
    return mask.join('.');
  }

// Inserting results into table

function insert_Row(title, result) {
    var x=document.getElementById('Result').insertRow(-1);
    var y = x.insertCell(0);
    var z = x.insertCell(1);
    y.innerHTML= title;
    z.innerHTML= result;
}

// Main calculation

function CalculateIPv4() {
    function ipToBinary(ip) {
        return ip.split('.')
            .map(octet => parseInt(octet, 10).toString(2).padStart(8, '0'))
            .join('');
    }
    
    function binaryToIp(binary) {
        return binary.match(/.{1,8}/g)
            .map(byte => parseInt(byte, 2))
            .join('.');
    }

    // Calculate the available hosts by counting the number of '0's in the subnet mask binary string
    function calculateAvailableHosts(subnetMask) {
        const numberOfHostBits = subnetMaskBinary.split('').filter(bit => bit === '0').length;
        const totalAddresses = Math.pow(2, numberOfHostBits);
        return totalAddresses
    }

    // Calculate using input

    const IpAddress = document.getElementById('ipInput').value;
    let SubnetMask = document.getElementById('smInput').value;

    const subnetDecimal = createNetmaskAddr(SubnetMask);

    const ipBinary = ipToBinary(IpAddress);
    const subnetMaskBinary = ipToBinary(subnetDecimal);

    const networkAddressBinary = ipBinary.split('').map((bit, index) => bit & subnetMaskBinary[index]).join('');
    const networkAddressDecimal = binaryToIp(networkAddressBinary);

    const broadcastAddressBinary = networkAddressBinary.split('').map((bit, index) => subnetMaskBinary[index] === '1' ? bit : '1').join('');
    const broadcastAddressDecimal = binaryToIp(broadcastAddressBinary);

    const firstHostBinary = networkAddressBinary.slice(0, -1) + '1';
    const firstHostDecimal = binaryToIp(firstHostBinary);

    const lastHostBinary = broadcastAddressBinary.slice(0, -1) + '0';
    const lastHostDecimal = binaryToIp(lastHostBinary);

    let TotalHosts;
    let TotalUsableHosts;

    // Catch for /32 subnets as the normal calculation breaks

    if (SubnetMask == 32) {
        TotalHosts = 1;
        TotalUsableHosts = 0;
    } else {
        TotalHosts = calculateAvailableHosts(subnetMaskBinary);
        TotalUsableHosts = calculateAvailableHosts(subnetMaskBinary) -2;
    }

    // Reset table

    var Table = document.getElementById("Result");
    Table.innerHTML = "";

    // Print Results

    insert_Row("Binary Ip Address:", ipBinary)
    insert_Row("Binary Subnet Mask", subnetMaskBinary)
    insert_Row("Network Address:", networkAddressDecimal);
    insert_Row("Broadcast Address:", broadcastAddressDecimal);
    insert_Row("First Host:", firstHostDecimal);
    insert_Row("Last Host:", lastHostDecimal);
    insert_Row("Total Hosts:", TotalHosts);
    insert_Row("Total Usable Hosts:", TotalUsableHosts);
}