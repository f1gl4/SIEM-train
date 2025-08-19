import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  await prisma.malware.create({
    data: {
      name: 'WannaCry',
      firstSeen: new Date('2017-05-12'),
      description: 'Ransomware, using EternalBlue',
      type: 'ransomware',
      severity: 9,
      incidents: {
        create: [
          {
            occurredAt: new Date('2017-05-12'),
            location: 'Global',
            summary: 'Massive outbreak',
          },
        ],
      },
    },
  });

  await prisma.malware.create({
    data: {
      name: 'Petya/NotPetya',
      firstSeen: new Date('2016-03-01'),
      description: 'Destructive "wiper" masquerading as ransomware',
      type: 'wiper',
      severity: 10,
    },
  });

  await prisma.malware.create({
    data: {
      name: 'Chernobyl (CIH)',
      firstSeen: new Date('1998-06-26'),
      description: 'Win9x/ME virus-wiper, erased Flash BIOS and MBR on April 26',
      type: 'wiper',
      severity: 10,
    },
  });

  await prisma.malware.create({
    data: {
      name: 'BadRabbit',
      firstSeen: new Date('2017-10-24'),
      description: 'WannaCry-like ransomware with SMB distribution',
      type: 'ransomware',
      severity: 8,
    },
  });

  await prisma.malware.create({
    data: {
      name: 'LoveLetter (ILOVEYOU)',
      firstSeen: new Date('2000-05-04'),
      description: 'Mass worm in "ILOVEYOU" emails: encrypted/forwarded files',
      type: 'worm',
      severity: 6,
    },
  });

  await prisma.incident.createMany({
    data: [
      // WannaCry
      {
        malwareId: 1, location: 'Russia', occurredAt: new Date('2017-05-12'),
        summary: 'The largest number of infections in office PCs', victims: 45000
      },
      { malwareId: 1, location: 'India', occurredAt: new Date('2017-05-12'), victims: 48000 },
      {
        malwareId: 1, location: 'UK', occurredAt: new Date('2017-05-12'),
        summary: 'the systemic failure of the NHS', victims: 7000
      },
  
      // Petya
      {
        malwareId: 2, location: 'Ukraine', occurredAt: new Date('2017-06-27'),
        summary: 'Banks, metro, airport are affected', victims: 12000
      },
      { malwareId: 2, location: 'Germany', occurredAt: new Date('2017-06-27'), victims: 1500 },
      { malwareId: 2, location: 'Russia', occurredAt: new Date('2017-06-27'), victims: 1000 },
  
      // Chernobyl (CIH)
      {
        malwareId: 3, location: 'Taiwan', occurredAt: new Date('1999-04-26'),
        summary: 'Erasing the BIOS in home users PCs', victims: 200000
      },
      { malwareId: 3, location: 'USA', occurredAt: new Date('1999-04-26'), victims: 100000 },
  
      // BadRabbit
      {
        malwareId: 4, location: 'Russia', occurredAt: new Date('2017-10-24'),
        summary: 'Media companies, metro are affected', victims: 70,
      },
      { malwareId: 4, location: 'Ukraine', occurredAt: new Date('2017-10-24'), victims: 50 },
  
      // LoveLetter
      {
        malwareId: 5, location: 'USA', occurredAt: new Date('2000-05-04'),
        summary: 'Mass mailing of "ILOVEYOU"', victims: 3000000,
      },
      { malwareId: 5, location: 'UK', occurredAt: new Date('2000-05-04'), victims: 1000000 },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
