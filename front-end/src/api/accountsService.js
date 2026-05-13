const API_BASE_URL = 'http://localhost:8080/core/v1/accounts';

let testData = null;

export async function loadTestData() {
  if (!testData) {
    try {
      const response = await fetch('http://localhost:8080/core/v1/auth/test-data');
      if (response.ok) {
        testData = await response.json();
      }
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  }
  return testData;
}

export async function getAccountsByCustomerId(customerId) {
  try {
    const data = await loadTestData();
    const coreUserId = data?.coreUserId || 1;

    const response = await fetch(`${API_BASE_URL}/customer/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Core-User-Id': String(coreUserId),
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching accounts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAccountsByCustomerId:', error);
    throw error;
  }
}

export async function getAccountByNumber(accountNumber) {
  try {
    const data = await loadTestData();
    const coreUserId = data?.coreUserId || 1;

    const response = await fetch(`${API_BASE_URL}/${accountNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Core-User-Id': String(coreUserId),
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching account: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAccountByNumber:', error);
    throw error;
  }
}
