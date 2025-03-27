// Mock patient search results
export const mockPatients = [
  {
    uuid: "8673ee4f-e2ab-4077-ba55-4980f408773e",
    display: "John Smith",
    identifiers: [
      {
        display: "OpenMRS ID: MRS-1234",
        uuid: "1234-1234-1234-1234",
        identifier: "MRS-1234",
        identifierType: {
          display: "OpenMRS ID",
          uuid: "05a29f94-c0ed-11e2-94be-8c13b969e334"
        }
      }
    ],
    person: {
      gender: "M",
      age: 38,
      birthdate: "1986-01-15T00:00:00.000+0000",
      preferredAddress: {
        address1: "123 Main St",
        cityVillage: "Boston",
        stateProvince: "MA",
        country: "USA",
        postalCode: "02115"
      }
    }
  },
  {
    uuid: "5946f880-b197-400b-9caa-a3c661d23041",
    display: "Jane Smith",
    identifiers: [
      {
        display: "OpenMRS ID: MRS-5678",
        uuid: "5678-5678-5678-5678",
        identifier: "MRS-5678",
        identifierType: {
          display: "OpenMRS ID",
          uuid: "05a29f94-c0ed-11e2-94be-8c13b969e334"
        }
      }
    ],
    person: {
      gender: "F",
      age: 35,
      birthdate: "1989-04-22T00:00:00.000+0000",
      preferredAddress: {
        address1: "456 Oak Ave",
        cityVillage: "Boston",
        stateProvince: "MA",
        country: "USA",
        postalCode: "02116"
      }
    }
  },
  {
    uuid: "1f6ded01-b617-4a0f-88a0-e35a8e3dd49d",
    display: "Robert Johnson",
    identifiers: [
      {
        display: "OpenMRS ID: MRS-9012",
        uuid: "9012-9012-9012-9012",
        identifier: "MRS-9012",
        identifierType: {
          display: "OpenMRS ID",
          uuid: "05a29f94-c0ed-11e2-94be-8c13b969e334"
        }
      }
    ],
    person: {
      gender: "M",
      age: 42,
      birthdate: "1982-09-10T00:00:00.000+0000",
      preferredAddress: {
        address1: "789 Pine St",
        cityVillage: "Cambridge",
        stateProvince: "MA",
        country: "USA",
        postalCode: "02138"
      }
    }
  }
];

// Mock patient detailed data
export const mockPatientData = {
  // Patient 1: John Smith
  "8673ee4f-e2ab-4077-ba55-4980f408773e": {
    demographics: {
      uuid: "8673ee4f-e2ab-4077-ba55-4980f408773e",
      display: "John Smith",
      identifiers: [
        {
          display: "OpenMRS ID: MRS-1234",
          uuid: "1234-1234-1234-1234",
          identifier: "MRS-1234",
          identifierType: {
            display: "OpenMRS ID",
            uuid: "05a29f94-c0ed-11e2-94be-8c13b969e334"
          }
        }
      ],
      person: {
        gender: "M",
        age: 38,
        birthdate: "1986-01-15T00:00:00.000+0000",
        display: "John Smith",
        addresses: [
          {
            address1: "123 Main St",
            address2: "Apt 4B",
            cityVillage: "Boston",
            stateProvince: "MA",
            country: "USA",
            postalCode: "02115"
          }
        ]
      }
    },
    encounters: [
      {
        uuid: "e1d45232-5678-4321-9876-5432abcd1234",
        encounterDatetime: "2023-01-10T09:30:00.000+0000",
        encounterType: {
          display: "Check-up Visit"
        },
        location: {
          display: "Boston Medical Center"
        },
        encounterProviders: [
          {
            provider: {
              display: "Dr. Jane Doe"
            }
          }
        ],
        obs: [
          {
            concept: {
              display: "Blood Pressure",
              units: "mmHg"
            },
            value: "120/80",
            obsDatetime: "2023-01-10T09:35:00.000+0000"
          },
          {
            concept: {
              display: "Weight",
              units: "kg"
            },
            value: "75",
            obsDatetime: "2023-01-10T09:33:00.000+0000"
          },
          {
            concept: {
              display: "Height",
              units: "cm"
            },
            value: "180",
            obsDatetime: "2023-01-10T09:34:00.000+0000"
          }
        ]
      },
      {
        uuid: "f2e56343-6789-5432-0987-6543bcde2345",
        encounterDatetime: "2022-10-15T14:00:00.000+0000",
        encounterType: {
          display: "Follow-up Visit"
        },
        location: {
          display: "Boston Medical Center"
        },
        encounterProviders: [
          {
            provider: {
              display: "Dr. John Smith"
            }
          }
        ],
        obs: [
          {
            concept: {
              display: "Blood Pressure",
              units: "mmHg"
            },
            value: "118/78",
            obsDatetime: "2022-10-15T14:05:00.000+0000"
          },
          {
            concept: {
              display: "Weight",
              units: "kg"
            },
            value: "77",
            obsDatetime: "2022-10-15T14:03:00.000+0000"
          }
        ]
      }
    ],
    observations: [
      {
        uuid: "abc12345-1234-5678-9012-3456def78901",
        obsDatetime: "2023-01-10T09:35:00.000+0000",
        concept: {
          display: "Blood Pressure",
          units: "mmHg"
        },
        value: "120/80",
        status: "FINAL"
      },
      {
        uuid: "bcd23456-2345-6789-0123-4567efg89012",
        obsDatetime: "2023-01-10T09:33:00.000+0000",
        concept: {
          display: "Weight",
          units: "kg"
        },
        value: "75",
        status: "FINAL"
      },
      {
        uuid: "cde34567-3456-7890-1234-5678fgh90123",
        obsDatetime: "2023-01-10T09:34:00.000+0000",
        concept: {
          display: "Height",
          units: "cm"
        },
        value: "180",
        status: "FINAL"
      },
      {
        uuid: "def45678-4567-8901-2345-6789hij01234",
        obsDatetime: "2022-10-15T14:05:00.000+0000",
        concept: {
          display: "Blood Pressure",
          units: "mmHg"
        },
        value: "118/78",
        status: "FINAL"
      },
      {
        uuid: "efg56789-5678-9012-3456-7890ijk12345",
        obsDatetime: "2022-10-15T14:03:00.000+0000",
        concept: {
          display: "Weight",
          units: "kg"
        },
        value: "77",
        status: "FINAL"
      },
      {
        uuid: "fgh67890-6789-0123-4567-8901jkl23456",
        obsDatetime: "2022-10-15T14:07:00.000+0000",
        concept: {
          display: "Temperature",
          units: "°C"
        },
        value: "36.8",
        status: "FINAL"
      },
      {
        uuid: "ghi78901-7890-1234-5678-9012klm34567",
        obsDatetime: "2023-01-10T09:40:00.000+0000",
        concept: {
          display: "Smoking Status"
        },
        value: {
          display: "Non-smoker"
        },
        status: "FINAL"
      }
    ],
    conditions: [
      {
        uuid: "hij89012-8901-2345-6789-0123lmn45678",
        condition: {
          display: "Hypertension"
        },
        onsetDate: "2020-05-15T00:00:00.000+0000",
        clinicalStatus: {
          display: "Active"
        },
        verificationStatus: {
          display: "Confirmed"
        },
        additionalDetail: "Well-controlled with medication"
      },
      {
        uuid: "ijk90123-9012-3456-7890-1234mno56789",
        condition: {
          display: "Type 2 Diabetes"
        },
        onsetDate: "2021-03-20T00:00:00.000+0000",
        clinicalStatus: {
          display: "Active"
        },
        verificationStatus: {
          display: "Confirmed"
        },
        additionalDetail: "Managing with diet and exercise"
      }
    ]
  },
  
  // Patient 2: Jane Smith
  "5946f880-b197-400b-9caa-a3c661d23041": {
    demographics: {
      uuid: "5946f880-b197-400b-9caa-a3c661d23041",
      display: "Jane Smith",
      identifiers: [
        {
          display: "OpenMRS ID: MRS-5678",
          uuid: "5678-5678-5678-5678",
          identifier: "MRS-5678",
          identifierType: {
            display: "OpenMRS ID",
            uuid: "05a29f94-c0ed-11e2-94be-8c13b969e334"
          }
        }
      ],
      person: {
        gender: "F",
        age: 35,
        birthdate: "1989-04-22T00:00:00.000+0000",
        display: "Jane Smith",
        addresses: [
          {
            address1: "456 Oak Ave",
            address2: "Unit 7C",
            cityVillage: "Boston",
            stateProvince: "MA",
            country: "USA",
            postalCode: "02116"
          }
        ]
      }
    },
    encounters: [
      {
        uuid: "klm01234-0123-4567-8901-2345pqr67890",
        encounterDatetime: "2023-02-05T10:15:00.000+0000",
        encounterType: {
          display: "Annual Physical"
        },
        location: {
          display: "Women's Health Clinic"
        },
        encounterProviders: [
          {
            provider: {
              display: "Dr. Sarah Johnson"
            }
          }
        ],
        obs: [
          {
            concept: {
              display: "Blood Pressure",
              units: "mmHg"
            },
            value: "110/70",
            obsDatetime: "2023-02-05T10:20:00.000+0000"
          },
          {
            concept: {
              display: "Weight",
              units: "kg"
            },
            value: "65",
            obsDatetime: "2023-02-05T10:18:00.000+0000"
          },
          {
            concept: {
              display: "Height",
              units: "cm"
            },
            value: "165",
            obsDatetime: "2023-02-05T10:19:00.000+0000"
          }
        ]
      }
    ],
    observations: [
      {
        uuid: "lmn12345-1234-5678-9012-3456qrs78901",
        obsDatetime: "2023-02-05T10:20:00.000+0000",
        concept: {
          display: "Blood Pressure",
          units: "mmHg"
        },
        value: "110/70",
        status: "FINAL"
      },
      {
        uuid: "mno23456-2345-6789-0123-4567rst89012",
        obsDatetime: "2023-02-05T10:18:00.000+0000",
        concept: {
          display: "Weight",
          units: "kg"
        },
        value: "65",
        status: "FINAL"
      },
      {
        uuid: "nop34567-3456-7890-1234-5678stu90123",
        obsDatetime: "2023-02-05T10:19:00.000+0000",
        concept: {
          display: "Height",
          units: "cm"
        },
        value: "165",
        status: "FINAL"
      },
      {
        uuid: "opq45678-4567-8901-2345-6789tuv01234",
        obsDatetime: "2023-02-05T10:25:00.000+0000",
        concept: {
          display: "Allergies"
        },
        value: {
          display: "Penicillin"
        },
        status: "FINAL"
      }
    ],
    conditions: [
      {
        uuid: "pqr56789-5678-9012-3456-7890uvw12345",
        condition: {
          display: "Asthma"
        },
        onsetDate: "2010-07-10T00:00:00.000+0000",
        clinicalStatus: {
          display: "Active"
        },
        verificationStatus: {
          display: "Confirmed"
        },
        additionalDetail: "Seasonal triggers, uses inhaler as needed"
      },
      {
        uuid: "qrs67890-6789-0123-4567-8901vwx23456",
        condition: {
          display: "Migraine"
        },
        onsetDate: "2018-11-30T00:00:00.000+0000",
        clinicalStatus: {
          display: "Active"
        },
        verificationStatus: {
          display: "Confirmed"
        },
        additionalDetail: "Occurs approximately once per month"
      }
    ]
  },
  
  // Patient 3: Robert Johnson
  "1f6ded01-b617-4a0f-88a0-e35a8e3dd49d": {
    demographics: {
      uuid: "1f6ded01-b617-4a0f-88a0-e35a8e3dd49d",
      display: "Robert Johnson",
      identifiers: [
        {
          display: "OpenMRS ID: MRS-9012",
          uuid: "9012-9012-9012-9012",
          identifier: "MRS-9012",
          identifierType: {
            display: "OpenMRS ID",
            uuid: "05a29f94-c0ed-11e2-94be-8c13b969e334"
          }
        }
      ],
      person: {
        gender: "M",
        age: 42,
        birthdate: "1982-09-10T00:00:00.000+0000",
        display: "Robert Johnson",
        addresses: [
          {
            address1: "789 Pine St",
            address2: "",
            cityVillage: "Cambridge",
            stateProvince: "MA",
            country: "USA",
            postalCode: "02138"
          }
        ]
      }
    },
    encounters: [
      {
        uuid: "rst78901-7890-1234-5678-9012wxy34567",
        encounterDatetime: "2022-12-18T13:45:00.000+0000",
        encounterType: {
          display: "Urgent Care Visit"
        },
        location: {
          display: "Cambridge Health Alliance"
        },
        encounterProviders: [
          {
            provider: {
              display: "Dr. Michael Brown"
            }
          }
        ],
        obs: [
          {
            concept: {
              display: "Blood Pressure",
              units: "mmHg"
            },
            value: "140/90",
            obsDatetime: "2022-12-18T13:50:00.000+0000"
          },
          {
            concept: {
              display: "Temperature",
              units: "°C"
            },
            value: "38.5",
            obsDatetime: "2022-12-18T13:48:00.000+0000"
          },
          {
            concept: {
              display: "Respiratory Rate",
              units: "breaths/min"
            },
            value: "20",
            obsDatetime: "2022-12-18T13:52:00.000+0000"
          }
        ],
        diagnoses: [
          {
            display: "Acute Bronchitis",
            certainty: "CONFIRMED",
            rank: 1
          }
        ]
      }
    ],
    observations: [
      {
        uuid: "stu89012-8901-2345-6789-0123xyz45678",
        obsDatetime: "2022-12-18T13:50:00.000+0000",
        concept: {
          display: "Blood Pressure",
          units: "mmHg"
        },
        value: "140/90",
        status: "FINAL"
      },
      {
        uuid: "tuv90123-9012-3456-7890-1234yza56789",
        obsDatetime: "2022-12-18T13:48:00.000+0000",
        concept: {
          display: "Temperature",
          units: "°C"
        },
        value: "38.5",
        status: "FINAL"
      },
      {
        uuid: "uvw01234-0123-4567-8901-2345zab67890",
        obsDatetime: "2022-12-18T13:52:00.000+0000",
        concept: {
          display: "Respiratory Rate",
          units: "breaths/min"
        },
        value: "20",
        status: "FINAL"
      },
      {
        uuid: "vwx12345-1234-5678-9012-3456abc78901",
        obsDatetime: "2022-12-18T14:00:00.000+0000",
        concept: {
          display: "Oxygen Saturation",
          units: "%"
        },
        value: "96",
        status: "FINAL"
      }
    ],
    conditions: [
      {
        uuid: "wxy23456-2345-6789-0123-4567bcd89012",
        condition: {
          display: "Hypertension"
        },
        onsetDate: "2019-02-10T00:00:00.000+0000",
        clinicalStatus: {
          display: "Active"
        },
        verificationStatus: {
          display: "Confirmed"
        },
        additionalDetail: "Medication adjusted at last visit"
      },
      {
        uuid: "xyz34567-3456-7890-1234-5678cde90123",
        condition: {
          display: "Acute Bronchitis"
        },
        onsetDate: "2022-12-15T00:00:00.000+0000",
        endDate: "2023-01-05T00:00:00.000+0000",
        clinicalStatus: {
          display: "Resolved"
        },
        verificationStatus: {
          display: "Confirmed"
        },
        additionalDetail: "Treated with antibiotics and recovered fully"
      }
    ]
  }
};