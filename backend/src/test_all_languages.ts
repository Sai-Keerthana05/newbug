import { analyzeCodeWithAI } from './services/aiService';

const TEST_CASES = [
  {
    language: 'python',
    name: 'Python: Bare except and missing math module with zero division',
    code: `def calculate_hypotenuse(a, b):
    try:
        val = a / b
        return math.sqrt(val)
    except:
        return 0
print(calculate_hypotenuse(10, 0))`,
    errorMessage: 'ZeroDivisionError: division by zero, NameError: name "math" is not defined'
  },
  {
    language: 'javascript',
    name: 'JavaScript: Loose equality and unhandled promise rejection with var',
    code: `function checkUser(id) {
    var queryId = "10";
    if (id == 10) {
        return Promise.resolve("Access Granted");
    }
    return Promise.reject("Unauthorized");
}
checkUser("10").then(res => console.log(res));`,
    errorMessage: 'UnhandledPromiseRejectionWarning: Unhandled promise rejection'
  },
  {
    language: 'java',
    name: 'Java: String reference comparison with == and missing List imports',
    code: `public class TestAuth {
    public static void main(String[] args) {
        String tokenA = new String("secret");
        String tokenB = new String("secret");
        if (tokenA == tokenB) {
            System.out.println("Valid Token");
        }
        List<String> logs = new ArrayList<>();
        logs.add("Checked");
    }
}`,
    errorMessage: 'cannot find symbol: class List'
  },
  {
    language: 'cpp',
    name: 'C++: Missing iostream/vector headers and unqualified std::',
    code: `int main() {
    vector<int> nums = {1, 2, 3};
    cout << "Count: " << nums.size() << endl;
    return 0;
}`,
    errorMessage: "'vector' was not declared in this scope; 'cout' was not declared in this scope"
  },
  {
    language: 'c',
    name: 'C: Missing stdio.h, format mismatch, and missing return 0',
    code: `int main() {
    int age = 30;
    printf("Age is %s\\n", age);
}`,
    errorMessage: "implicit declaration of function 'printf'; format '%s' expects argument of type 'char *', but argument 2 has type 'int'"
  },
  {
    language: 'csharp',
    name: 'C#: Missing System namespace and unhandled null reference',
    code: `class App {
    static void Main() {
        string name = null;
        Console.WriteLine(name.ToLower());
    }
}`,
    errorMessage: "The name 'Console' does not exist in the current context"
  },
  {
    language: 'php',
    name: 'PHP: Missing opening tag and loose comparison',
    code: `function verifyRole($role) {
    if ($role == 0) {
        return "Admin";
    }
    return "User";
}
echo verifyRole("test");`,
    errorMessage: 'Parse error: syntax error'
  },
  {
    language: 'sql',
    name: 'SQL: Invalid clause sequence with WHERE after GROUP BY',
    code: `SELECT dept_id, COUNT(*)
FROM employees
GROUP BY dept_id
WHERE salary > 50000;`,
    errorMessage: 'syntax error at or near "WHERE"'
  }
];

async function runTests() {
  console.log('====================================================');
  console.log('BUG REPLIER MULTI-LANGUAGE DEBUG ENGINE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const t of TEST_CASES) {
    console.log(`Running test: [${t.language.toUpperCase()}] ${t.name}`);
    try {
      const res = await analyzeCodeWithAI({
        code: t.code,
        language: t.language,
        errorMessage: t.errorMessage
      });

      const hasCorrectedCode = Boolean(res.corrected_code && res.corrected_code.trim().length > 10);
      const notPlaceholder = !res.corrected_code.includes('rest of the code');
      const hasTitle = Boolean(res.bug_title && res.bug_title.length > 0);
      const hasChanges = Array.isArray(res.changes_made) && res.changes_made.length > 0;
      const hasVerification = Boolean(res.verification_status);

      if (hasCorrectedCode && notPlaceholder && hasTitle && hasChanges && hasVerification) {
        console.log(`  PASSED`);
        console.log(`  Bug Title: ${res.bug_title}`);
        console.log(`  Error Type: ${res.error_type}`);
        console.log(`  Verification: ${res.verification_status}`);
        console.log(`  Changes Made: ${res.changes_made.length} changes`);
        console.log(`  First Line of Corrected Code: ${res.corrected_code.trim().split('\n')[0]}`);
        console.log('----------------------------------------------------');
        passed++;
      } else {
        console.error(`  FAILED: Invalid or incomplete output structure.`);
        failed++;
      }
    } catch (err: any) {
      console.error(`  FAILED with exception:`, err.message);
      failed++;
    }
  }

  console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed out of ${TEST_CASES.length} Languages Tested.`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

