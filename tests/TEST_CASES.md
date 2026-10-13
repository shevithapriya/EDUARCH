# EduArch Sample Test Cases

**Note:** These are manual acceptance-test examples, not evidence that automated tests currently exist. Update expected behavior to match the implemented product.

| ID | Area | Test | Steps | Expected result |
|---|---|---|---|---|
| TC-01 | Startup | Frontend starts | Install dependencies and run the documented frontend script | Development server starts without errors |
| TC-02 | Startup | Backend starts | Configure required environment variables and run the backend script | API server starts and reports its port |
| TC-03 | Lessons | Open a lesson | Select a lesson from the lesson list | Correct lesson title and content are shown |
| TC-04 | Language | Switch language | Select English, then Tamil | Supported content is shown in the selected language |
| TC-05 | Quiz | Correct answer | Open sample quiz and select the correct option | Correct-answer feedback is displayed |
| TC-06 | Quiz | Incorrect answer | Select an incorrect option | Incorrect-answer feedback is displayed without crashing |
| TC-07 | Video | Video generation succeeds | Use a valid, authorized test configuration | UI reports success only after the service confirms it |
| TC-08 | Video | AI provider rejects request | Use a controlled invalid/unavailable test configuration | UI displays a useful failure message; no false success |
| TC-09 | Secrets | Missing API key | Remove required AI key in a local test environment | AI feature returns a clear configuration error |
| TC-10 | Security | API key is not exposed | Inspect built frontend assets and browser network responses | Private API key is not present |
| TC-11 | Resilience | Network interruption | Interrupt a request during a test | User receives an error or retry option |
| TC-12 | Accessibility | Keyboard navigation | Navigate lesson and quiz controls using keyboard | Interactive controls can be reached and used |

## Manual Test Checklist

- [ ] Fresh install succeeds on a clean environment.
- [ ] README setup steps match actual npm scripts.
- [ ] Required environment variables are documented.
- [ ] English and Tamil flows are tested where implemented.
- [ ] Quiz score and feedback are correct.
- [ ] Video job pending/success/failure states are handled.
- [ ] No API keys or personal student information are committed.
- [ ] Browser console and server logs are checked for unexpected errors.

## Suggested Automated Test Coverage

Once a test framework is selected, add tests for:
- Lesson/quiz data validation
- Quiz answer scoring
- API request validation
- Video generation route success and failure responses
- Missing environment variables
- Language selection and content rendering
