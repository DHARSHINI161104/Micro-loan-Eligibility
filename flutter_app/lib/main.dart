import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const MicroLoanApp());
}

class MicroLoanApp extends StatelessWidget {
  const MicroLoanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Micro Loan Eligibility',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFFF5F5F5),
        fontFamily: 'Roboto',
      ),
      home: const RegistrationScreen(),
    );
  }
}

const String API_BASE = 'http://10.0.2.2:3000';
const String SCORING_API = 'http://10.0.2.2:8000';

class ApiService {
  static Future<Map<String, dynamic>> registerUser(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$API_BASE/user/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> saveFinancialData(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$API_BASE/user/financial-data'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> getScoreHistory(String userId) async {
    final response = await http.get(
      Uri.parse('$API_BASE/user/score-history?userId=$userId'),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> getLoanMatcher(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$API_BASE/loan-matcher'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> getChatbotResponse(String message, String language) async {
    final response = await http.post(
      Uri.parse('$API_BASE/chatbot'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'message': message, 'language': language}),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> calculateScore(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$SCORING_API/calculate-score'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }
}

class AppState extends ChangeNotifier {
  String? userId;
  String language = 'en';
  Map<String, dynamic>? currentScore;
  List<Map<String, dynamic>> scoreHistory = [];

  void setUserId(String id) {
    userId = id;
    notifyListeners();
  }

  void setLanguage(String lang) {
    language = lang;
    notifyListeners();
  }

  void setCurrentScore(Map<String, dynamic> score) {
    currentScore = score;
    notifyListeners();
  }

  void addToHistory(Map<String, dynamic> score) {
    scoreHistory.add(score);
    notifyListeners();
  }

  String getTranslatedText(Map<String, dynamic> texts) {
    if (language == 'en') return texts['en'] ?? '';
    if (language == 'hi') return texts['hi'] ?? texts['en'] ?? '';
    if (language == 'ta') return texts['ta'] ?? texts['en'] ?? '';
    return texts['en'] ?? '';
  }
}

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _isIndianCitizen = false;
  String _idProofType = 'none';
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register'),
        backgroundColor: Colors.blue[800],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Create Account',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'Enter your details to get started',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 30),
            _buildTextField('Full Name', _nameController, Icons.person),
            const SizedBox(height: 20),
            _buildTextField('Phone Number', _phoneController, Icons.phone, keyboardType: TextInputType.phone),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Row(
                children: [
                  Checkbox(
                    value: _isIndianCitizen,
                    onChanged: (val) => setState(() => _isIndianCitizen = val!),
                  ),
                  const Expanded(
                    child: Text('I am an Indian Citizen', style: TextStyle(fontSize: 16)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text('ID Proof', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            _buildIdProofSelector(),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _register,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[800],
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Continue', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, IconData icon, {TextInputType? keyboardType}) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
      ),
    );
  }

  Widget _buildIdProofSelector() {
    return Row(
      children: [
        _buildProofChip('Aadhaar', 'aadhaar'),
        const SizedBox(width: 10),
        _buildProofChip('PAN', 'pan'),
        const SizedBox(width: 10),
        _buildProofChip('None', 'none'),
      ],
    );
  }

  Widget _buildProofChip(String label, String value) {
    final isSelected = _idProofType == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (sel) => setState(() => _idProofType = value),
      selectedColor: Colors.blue[200],
    );
  }

  Future<void> _register() async {
    if (_nameController.text.isEmpty || _phoneController.text.isEmpty) {
      _showError('Please fill all required fields');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await ApiService.registerUser({
        'name': _nameController.text,
        'phone': _phoneController.text,
        'isIndianCitizen': _isIndianCitizen,
        'idProofType': _idProofType,
      });

      if (response['userId'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('userId', response['userId']);
        
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => FinancialInputScreen(userId: response['userId'])),
          );
        }
      } else {
        _showError(response['error'] ?? 'Registration failed');
      }
    } catch (e) {
      _showError('Connection error. Please try again.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: Colors.red));
  }
}

class FinancialInputScreen extends StatefulWidget {
  final String userId;
  const FinancialInputScreen({super.key, required this.userId});

  @override
  State<FinancialInputScreen> createState() => _FinancialInputScreenState();
}

class _FinancialInputScreenState extends State<FinancialInputScreen> {
  final _month1Controller = TextEditingController();
  final _month2Controller = TextEditingController();
  final _month3Controller = TextEditingController();
  final _expensesController = TextEditingController();
  final _emiController = TextEditingController();
  final _jobHistoryController = TextEditingController();
  final _bankNameController = TextEditingController();
  final _accountController = TextEditingController();
  final _ifscController = TextEditingController();
  final _bankContactController = TextEditingController();
  
  double _digitalPaymentRatio = 50;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Financial Details'), backgroundColor: Colors.blue[800]),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection('Earnings (Last 3 Months)', [
              _buildTextField('Month 1', _month1Controller, Icons.currency_rupee),
              const SizedBox(height: 10),
              _buildTextField('Month 2', _month2Controller, Icons.currency_rupee),
              const SizedBox(height: 10),
              _buildTextField('Month 3', _month3Controller, Icons.currency_rupee),
            ]),
            const SizedBox(height: 20),
            _buildSection('Monthly Expenses', [
              _buildTextField('Total Expenses', _expensesController, Icons.shopping_cart),
            ]),
            const SizedBox(height: 20),
            _buildSection('Existing EMI', [
              _buildTextField('Current EMI Amount', _emiController, Icons.payment),
            ]),
            const SizedBox(height: 20),
            _buildSection('Digital Payment Behaviour', [
              Slider(
                value: _digitalPaymentRatio,
                min: 0,
                max: 100,
                divisions: 20,
                label: '${_digitalPaymentRatio.toInt()}%',
                onChanged: (val) => setState(() => _digitalPaymentRatio = val),
              ),
              Center(child: Text('${_digitalPaymentRatio.toInt()}% digital payments', style: const TextStyle(fontSize: 16))),
            ]),
            const SizedBox(height: 20),
            _buildSection('Job History', [
              _buildTextField('Years of Experience', _jobHistoryController, Icons.work),
            ]),
            const SizedBox(height: 20),
            _buildSection('Bank Details', [
              _buildTextField('Bank Name', _bankNameController, Icons.account_balance),
              const SizedBox(height: 10),
              _buildTextField('Account Number', _accountController, Icons.numbers),
              const SizedBox(height: 10),
              _buildTextField('IFSC Code', _ifscController, Icons.code),
              const SizedBox(height: 10),
              _buildTextField('Bank Contact', _bankContactController, Icons.phone, keyboardType: TextInputType.phone),
            ]),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[800],
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Calculate Eligibility', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        ...children,
      ],
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, IconData icon, {TextInputType? keyboardType}) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType ?? TextInputType.number,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Future<void> _submit() async {
    if (_month1Controller.text.isEmpty || _month2Controller.text.isEmpty || 
        _month3Controller.text.isEmpty || _expensesController.text.isEmpty ||
        _jobHistoryController.text.isEmpty) {
      _showError('Please fill all required fields');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await ApiService.saveFinancialData({
        'userId': widget.userId,
        'earningsHistory': [
          double.parse(_month1Controller.text),
          double.parse(_month2Controller.text),
          double.parse(_month3Controller.text),
        ],
        'monthlyExpenses': double.parse(_expensesController.text),
        'emi': double.tryParse(_emiController.text) ?? 0,
        'digitalPaymentRatio': _digitalPaymentRatio,
        'jobHistory': double.parse(_jobHistoryController.text),
      });

      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => EligibilityResultScreen(score: response['score'])),
        );
      }
    } catch (e) {
      _showError('Error: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: Colors.red));
  }
}

class EligibilityResultScreen extends StatefulWidget {
  final Map<String, dynamic> score;
  const EligibilityResultScreen({super.key, required this.score});

  @override
  State<EligibilityResultScreen> createState() => _EligibilityResultScreenState();
}

class _EligibilityResultScreenState extends State<EligibilityResultScreen> {
  String _language = 'en';

  @override
  Widget build(BuildContext context) {
    final scoreData = widget.score;
    final totalScore = scoreData['score'] ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Eligibility Score'),
        backgroundColor: Colors.blue[800],
        actions: [
          PopupMenuButton<String>(
            onSelected: (val) => setState(() => _language = val),
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'en', child: Text('English')),
              const PopupMenuItem(value: 'hi', child: Text('हिंदी')),
              const PopupMenuItem(value: 'ta', child: Text('தமிழ்')),
            ],
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  const Icon(Icons.language, color: Colors.white),
                  const SizedBox(width: 5),
                  Text(_getLangLabel(_language), style: const TextStyle(color: Colors.white)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildScoreMeter(totalScore),
            const SizedBox(height: 30),
            _buildBreakdownChart(scoreData),
            const SizedBox(height: 20),
            _buildFactorList('✓ Factors That Helped', scoreData['helped_factors'] ?? [], Colors.green),
            const SizedBox(height: 10),
            _buildFactorList('⚠ Factors That Hurt', scoreData['hurt_factors'] ?? [], Colors.orange),
            const SizedBox(height: 20),
            if (scoreData['fraud_flag'] == true) _buildFraudWarning(scoreData['fraud_warning']),
            const SizedBox(height: 20),
            _buildSuggestions(scoreData['suggestions'] ?? []),
            const SizedBox(height: 30),
            Row(
              children: [
                Expanded(child: _buildNavButton('Loan Products', () => Navigator.push(context, MaterialPageRoute(builder: (context) => LoanProductScreen(score: totalScore))))),
                const SizedBox(width: 10),
                Expanded(child: _buildNavButton('Simulator', () => Navigator.push(context, MaterialPageRoute(builder: (context) => WhatIfSimulatorScreen(initialData: scoreData))))),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: _buildNavButton('History', () => Navigator.push(context, MaterialPageRoute(builder: (context) => ScoreHistoryScreen()))))),
                const SizedBox(width: 10),
                Expanded(child: _buildNavButton('Loan Coach', () => Navigator.push(context, MaterialPageRoute(builder: (context) => LoanCoachScreen()))))),
              ],
            ),
            const SizedBox(height: 10),
            _buildNavButton('Documents Checklist', () => Navigator.push(context, MaterialPageRoute(builder: (context) => DocumentChecklistScreen())), fullWidth: true),
            const SizedBox(height: 10),
            _buildNavButton('Chat with Us', () => Navigator.push(context, MaterialPageRoute(builder: (context) => ChatbotScreen(language: _language))), fullWidth: true),
          ],
        ),
      ),
    );
  }

  String _getLangLabel(String lang) {
    if (lang == 'hi') return 'HI';
    if (lang == 'ta') return 'TA';
    return 'EN';
  }

  Widget _buildScoreMeter(int score) {
    Color color;
    String label;
    if (score >= 70) { color = Colors.green; label = 'Excellent'; }
    else if (score >= 50) { color = Colors.orange; label = 'Good'; }
    else { color = Colors.red; label = 'Needs Improvement'; }

    return Container(
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.2), blurRadius: 10)]),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 180,
                height: 180,
                child: CircularProgressIndicator(
                  value: score / 100,
                  strokeWidth: 15,
                  backgroundColor: Colors.grey[200],
                  color: color,
                ),
              ),
              Column(
                children: [
                  Text('$score', style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: color)),
                  Text('/100', style: const TextStyle(fontSize: 18, color: Colors.grey)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 15),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
            child: Text(label, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
          ),
        ],
      ),
    );
  }

  Widget _buildBreakdownChart(Map<String, dynamic> scoreData) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(15)),
      child: Column(
        children: [
          const Text('Score Breakdown', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child: PieChart(
              PieChartData(
                sections: [
                  PieChartSectionData(value: (scoreData['income_factor'] ?? 0).toDouble(), title: 'Income\n${scoreData['income_factor']}', color: Colors.blue, radius: 60, titleStyle: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                  PieChartSectionData(value: (scoreData['expense_factor'] ?? 0).toDouble(), title: 'Expense\n${scoreData['expense_factor']}', color: Colors.green, radius: 60, titleStyle: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                  PieChartSectionData(value: (scoreData['emi_factor'] ?? 0).toDouble(), title: 'EMI\n${scoreData['emi_factor']}', color: Colors.orange, radius: 60, titleStyle: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                  PieChartSectionData(value: (scoreData['digital_factor'] ?? 0).toDouble(), title: 'Digital\n${scoreData['digital_factor']}', color: Colors.purple, radius: 60, titleStyle: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                ],
                sectionsSpace: 2,
                centerSpaceRadius: 40,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFactorList(String title, List<dynamic> factors, Color color) {
    if (factors.isEmpty) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 8),
          ...factors.map((f) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: Text('• $f', style: const TextStyle(fontSize: 14)),
          )),
        ],
      ),
    );
  }

  Widget _buildFraudWarning(String? warning) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.red)),
      child: Row(
        children: [
          const Icon(Icons.warning, color: Colors.red),
          const SizedBox(width: 10),
          Expanded(child: Text(warning ?? 'Fraud risk detected', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
        ],
      ),
    );
  }

  Widget _buildSuggestions(List<dynamic> suggestions) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('💡 Suggestions to Improve', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.blue)),
          const SizedBox(height: 10),
          ...suggestions.map((s) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: Text('• $s', style: const TextStyle(fontSize: 14)),
          )),
        ],
      ),
    );
  }

  Widget _buildNavButton(String label, VoidCallback onPressed, {bool fullWidth = false}) {
    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: 50,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[700], shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
        child: Text(label, style: const TextStyle(color: Colors.white)),
      ),
    );
  }
}

class LoanProductScreen extends StatefulWidget {
  final int score;
  const LoanProductScreen({super.key, required this.score});

  @override
  State<LoanProductScreen> createState() => _LoanProductScreenState();
}

class _LoanProductScreenState extends State<LoanProductScreen> {
  List<Map<String, dynamic>> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final response = await ApiService.getLoanMatcher({'score': widget.score, 'jobHistory': 1, 'monthlyExpenses': 10000, 'emi': 0});
      setState(() {
        _products = List<Map<String, dynamic>>.from(response['matchedLoans'] ?? []);
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Loan Products'), backgroundColor: Colors.blue[800]),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(15),
              itemCount: _products.length,
              itemBuilder: (context, index) => _buildProductCard(_products[index]),
            ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product) {
    return Card(
      margin: const EdgeInsets.only(bottom: 15),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Colors.blue[100], borderRadius: BorderRadius.circular(10)),
                  child: Icon(Icons.account_balance, color: Colors.blue[800]),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(product['name'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text(product['provider'] ?? '', style: TextStyle(color: Colors.grey[600])),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: Colors.green[100], borderRadius: BorderRadius.circular(20)),
                  child: Text('Eligible', style: TextStyle(color: Colors.green[800], fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 15),
            Text(product['description'] ?? '', style: TextStyle(color: Colors.grey[700])),
            const SizedBox(height: 10),
            Row(
              children: [
                _buildInfoChip('Max: ₹${_formatAmount(product['maxLoan'])}'),
                const SizedBox(width: 10),
                _buildInfoChip(product['interestRate'] ?? ''),
              ],
            ),
            const SizedBox(height: 15),
            const Text('Eligibility:', style: TextStyle(fontWeight: FontWeight.bold)),
            ...((product['eligibility'] as List?)?.map((e) => Text('• $e')) ?? []),
            const SizedBox(height: 15),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _launchUrl(product['applicationLink']),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[800], shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                child: const Text('Apply Now', style: TextStyle(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(15)),
      child: Text(text, style: TextStyle(fontSize: 12, color: Colors.grey[700])),
    );
  }

  String _formatAmount(dynamic amount) {
    if (amount is int) {
      if (amount >= 100000) return '${(amount / 100000).toStringAsFixed(1)}L';
      if (amount >= 1000) return '${(amount / 1000).toStringAsFixed(0)}K';
      return amount.toString();
    }
    return amount.toString();
  }

  Future<void> _launchUrl(String? url) async {
    if (url != null) {
      await launchUrl(Uri.parse(url));
    }
  }
}

class WhatIfSimulatorScreen extends StatefulWidget {
  final Map<String, dynamic> initialData;
  const WhatIfSimulatorScreen({super.key, required this.initialData});

  @override
  State<WhatIfSimulatorScreen> createState() => _WhatIfSimulatorScreenState();
}

class _WhatIfSimulatorScreenState extends State<WhatIfSimulatorScreen> {
  late double _expenses;
  late double _emi;
  late Map<String, dynamic> _result;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _expenses = (widget.initialData['inputData']?['monthlyExpenses'] ?? 20000).toDouble();
    _emi = (widget.initialData['inputData']?['emi'] ?? 0).toDouble();
    _result = widget.initialData;
  }

  Future<void> _recalculate() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService.calculateScore({
        'earnings_history': [35000, 35000, 35000],
        'monthly_expenses': _expenses,
        'emi': _emi,
        'digital_payment_ratio': 60,
        'job_history': 2,
      });
      setState(() => _result = response);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('What-If Simulator'), backgroundColor: Colors.blue[800]),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(25),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.2), blurRadius: 10)]),
              child: Column(
                children: [
                  Text('${_result['score'] ?? 0}', style: TextStyle(fontSize: 56, fontWeight: FontWeight.bold, color: _getScoreColor(_result['score'] ?? 0))),
                  const Text('/100', style: TextStyle(fontSize: 20, color: Colors.grey)),
                  const SizedBox(height: 10),
                  Text('Live Score', style: TextStyle(fontSize: 16, color: Colors.grey[600])),
                ],
              ),
            ),
            const SizedBox(height: 25),
            _buildSlider('Monthly Expenses', _expenses, 50000, (val) { setState(() => _expenses = val); }, '₹'),
            const SizedBox(height: 20),
            _buildSlider('Existing EMI', _emi, 20000, (val) { setState(() => _emi = val); }, '₹'),
            const SizedBox(height: 25),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _loading ? null : _recalculate,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[800], shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('Update Score', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
            const SizedBox(height: 25),
            _buildBreakdown(),
          ],
        ),
      ),
    );
  }

  Widget _buildSlider(String label, double value, double max, Function(double) onChanged, String prefix) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text('$prefix${value.toInt()}', style: TextStyle(fontSize: 18, color: Colors.blue[800], fontWeight: FontWeight.bold)),
          ],
        ),
        Slider(
          value: value,
          min: 0,
          max: max,
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildBreakdown() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(15)),
      child: Column(
        children: [
          _buildFactorRow('Income Factor', _result['income_factor'] ?? 0, 40, Colors.blue),
          _buildFactorRow('Expense Factor', _result['expense_factor'] ?? 0, 25, Colors.green),
          _buildFactorRow('EMI Factor', _result['emi_factor'] ?? 0, 20, Colors.orange),
          _buildFactorRow('Digital Factor', _result['digital_factor'] ?? 0, 15, Colors.purple),
        ],
      ),
    );
  }

  Widget _buildFactorRow(String label, int value, int max, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          SizedBox(width: 120, child: Text(label, style: const TextStyle(fontSize: 14))),
          Expanded(
            child: LinearProgressIndicator(
              value: value / max,
              backgroundColor: Colors.grey[200],
              color: color,
              minHeight: 8,
            ),
          ),
          const SizedBox(width: 10),
          Text('$value', style: TextStyle(fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Color _getScoreColor(int score) {
    if (score >= 70) return Colors.green;
    if (score >= 50) return Colors.orange;
    return Colors.red;
  }
}

class ScoreHistoryScreen extends StatefulWidget {
  const ScoreHistoryScreen({super.key});

  @override
  State<ScoreHistoryScreen> createState() => _ScoreHistoryScreenState();
}

class _ScoreHistoryScreenState extends State<ScoreHistoryScreen> {
  List<Map<String, dynamic>> _history = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId');
      if (userId != null) {
        final response = await ApiService.getScoreHistory(userId);
        setState(() {
          _history = List<Map<String, dynamic>>.from(response['scores'] ?? []);
          _loading = false;
        });
      } else {
        setState(() => _loading = false);
      }
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Score History'), backgroundColor: Colors.blue[800]),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _history.isEmpty
              ? const Center(child: Text('No score history yet'))
              : ListView.builder(
                  padding: const EdgeInsets.all(15),
                  itemCount: _history.length,
                  itemBuilder: (context, index) => _buildHistoryCard(_history[index], index),
                ),
    );
  }

  Widget _buildHistoryCard(Map<String, dynamic> score, int index) {
    final date = DateTime.tryParse(score['createdAt'] ?? '') ?? DateTime.now();
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(15),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(color: _getScoreColor(score['score']).withOpacity(0.1), borderRadius: BorderRadius.circular(30)),
              child: Center(child: Text('${score['score']}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _getScoreColor(score['score'])))),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${date.day}/${date.month}/${date.year}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text('Income: ${score['incomeFactor']} | Expense: ${score['expenseFactor']} | EMI: ${score['emiFactor']}', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }

  Color _getScoreColor(int score) {
    if (score >= 70) return Colors.green;
    if (score >= 50) return Colors.orange;
    return Colors.red;
  }
}

class LoanCoachScreen extends StatelessWidget {
  const LoanCoachScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tips = [
      {'title': 'Build Income Stability', 'tip': 'Maintain consistent earnings for 6+ months to improve income stability score by up to 40%', 'days': '30-60 days', 'icon': Icons.trending_up},
      {'title': 'Reduce Expenses', 'tip': 'Keep expenses below 50% of income to maximize your expense ratio score (25% weight)', 'days': '30 days', 'icon': Icons.savings},
      {'title': 'Clear Existing EMIs', 'tip': 'Pay off current EMIs to reduce debt burden. Target EMI < 20% of income', 'days': '60-90 days', 'icon': Icons.credit_card},
      {'title': 'Go Digital', 'tip': 'Increase digital payments to 60%+ for better credit visibility and 15% score boost', 'days': '14 days', 'icon': Icons.phone_android},
      {'title': 'Job Stability', 'tip': 'Build 2+ years of job history for additional scoring benefits', 'days': '90+ days', 'icon': Icons.work},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Loan Coach'), backgroundColor: Colors.blue[800]),
      body: ListView.builder(
        padding: const EdgeInsets.all(15),
        itemCount: tips.length,
        itemBuilder: (context, index) {
          final item = tips[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 15),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
            child: Padding(
              padding: const EdgeInsets.all(15),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: Colors.blue[100], borderRadius: BorderRadius.circular(10)),
                        child: Icon(item['icon'] as IconData, color: Colors.blue[800]),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item['title'] as String, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(color: Colors.green[100], borderRadius: BorderRadius.circular(10)),
                              child: Text('${item['days']}', style: TextStyle(fontSize: 12, color: Colors.green[800])),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(item['tip'] as String, style: TextStyle(color: Colors.grey[700])),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class DocumentChecklistScreen extends StatelessWidget {
  const DocumentChecklistScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final documents = [
      {'name': 'Aadhaar Card', 'required': true, 'icon': Icons.badge, 'desc': 'Valid government-issued ID proof'},
      {'name': 'PAN Card', 'required': false, 'icon': Icons.credit_card, 'desc': 'For income tax verification'},
      {'name': 'Bank Statement', 'required': true, 'icon': Icons.account_balance, 'desc': 'Last 3 months transaction history'},
      {'name': 'Salary Slip', 'required': true, 'icon': Icons.receipt, 'desc': 'Last 3 months salary slips'},
      {'name': 'Photo', 'required': true, 'icon': Icons.photo_camera, 'desc': 'Passport size photograph'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Document Checklist'), backgroundColor: Colors.blue[800]),
      body: ListView.builder(
        padding: const EdgeInsets.all(15),
        itemCount: documents.length,
        itemBuilder: (context, index) {
          final doc = documents[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: (doc['required'] as bool) ? Colors.green[100] : Colors.grey[100],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(doc['icon'] as IconData, color: (doc['required'] as bool) ? Colors.green[800] : Colors.grey[600]),
              ),
              title: Row(
                children: [
                  Text(doc['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
                  if (doc['required'] as bool) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: Colors.red[100], borderRadius: BorderRadius.circular(10)),
                      child: Text('Required', style: TextStyle(fontSize: 10, color: Colors.red[800])),
                    ),
                  ],
                ],
              ),
              subtitle: Text(doc['desc'] as String),
              trailing: const Icon(Icons.check_circle_outline, color: Colors.green),
            ),
          );
        },
      ),
    );
  }
}

class ChatbotScreen extends StatefulWidget {
  final String language;
  const ChatbotScreen({super.key, required this.language});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final _messageController = TextEditingController();
  final List<Map<String, String>> _messages = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _messages.add({'role': 'bot', 'content': _getWelcomeMessage()});
  }

  String _getWelcomeMessage() {
    if (widget.language == 'hi') return 'नमस्ते! मैं आपका लोन सहायक हूं। मैं आपके लोन और पात्रता के बारे में सवालों में मदद कर सकता हूं।';
    if (widget.language == 'ta') return 'வணக்கம்! நான் உங்கள் கடன் உதவியாளன். கடன் மற்றும் தகுதி பற்றி கேள்விகளுக்கு உதவ முடியும்.';
    return 'Hello! I\'m your loan assistant. Ask me questions about loans and eligibility.';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Loan Assistant'), backgroundColor: Colors.blue[800]),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(15),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isBot = msg['role'] == 'bot';
                return Align(
                  alignment: isBot ? Alignment.centerLeft : Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(15),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isBot ? Colors.white : Colors.blue[800],
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 5)],
                    ),
                    child: Text(msg['content']!, style: TextStyle(color: isBot ? Colors.black87 : Colors.white)),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.2), blurRadius: 10)]),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Ask a question...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(25)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                CircleAvatar(
                  backgroundColor: Colors.blue[800],
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: _loading ? null : _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;

    setState(() {
      _messages.add({'role': 'user', 'content': message});
      _loading = true;
    });
    _messageController.clear();

    try {
      final response = await ApiService.getChatbotResponse(message, widget.language);
      setState(() {
        _messages.add({'role': 'bot', 'content': response['response'] ?? 'I didn\'t understand that.'});
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _messages.add({'role': 'bot', 'content': 'Sorry, I\'m having trouble connecting. Please try again.'});
        _loading = false;
      });
    }
  }
}
