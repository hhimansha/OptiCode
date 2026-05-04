export const structuredTasks = {

  // ═══════════════════════════════════════════════════════════════════════
  //  BEGINNER — Skill 1-2
  //  Only: print(), variables, basic math, simple loops, basic if/else
  // ═══════════════════════════════════════════════════════════════════════
  Beginner: {

  logic_error: [
    { task: "Print the sum of 5 and 10 using the + operator.", test_input: "", expected_output: "15", solution_code: "print(5 + 10)" },
    { task: "Print the result of 3 multiplied by 4.", test_input: "", expected_output: "12", solution_code: "print(3 * 4)" },
    { task: "Print the result of 20 minus 8.", test_input: "", expected_output: "12", solution_code: "print(20 - 8)" },
    { task: "Store 6 and 7 in variables a and b, then print their product.", test_input: "", expected_output: "42", solution_code: "a = 6\nb = 7\nprint(a * b)" },
    { task: "Print the result of 2 raised to the power of 5.", test_input: "", expected_output: "32", solution_code: "print(2 ** 5)" },
    { task: "Print the remainder of 17 divided by 5.", test_input: "", expected_output: "2", solution_code: "print(17 % 5)" },
    { task: "Print the result of 100 divided by 4.", test_input: "", expected_output: "25.0", validationType: "numeric", solution_code: "print(100 / 4)" },
    { task: "Write a function is_odd(n) that returns True if n is odd. Print is_odd(7).", test_input: "", expected_output: "True",
      solution_code: "def is_odd(n):\n    return n % 2 != 0\n\nprint(is_odd(7))" },
    { task: "Write a function max_of_two(a, b) that returns the larger number. Print max_of_two(4, 9).", test_input: "", expected_output: "9",
      solution_code: "def max_of_two(a, b):\n    return a if a > b else b\n\nprint(max_of_two(4, 9))" },
    { task: "Write a function absolute(n) that returns the absolute value. Print absolute(-5).", test_input: "", expected_output: "5",
      solution_code: "def absolute(n):\n    return n if n >= 0 else -n\n\nprint(absolute(-5))" }
  ],

  syntax_error: [
    { task: "Create a variable x = 10 and print it.", test_input: "", expected_output: "10", solution_code: "x = 10\nprint(x)" },
    { task: "Create a variable name = 'Alice' and print it.", test_input: "", expected_output: "Alice", solution_code: "name = 'Alice'\nprint(name)" },
    { task: "Create a variable pi = 3.14 and print it.", test_input: "", expected_output: "3.14", solution_code: "pi = 3.14\nprint(pi)" },
    { task: "Create a variable age = 20 and print it.", test_input: "", expected_output: "20", solution_code: "age = 20\nprint(age)" },
    { task: "Store the word Python in a variable and print it.", test_input: "", expected_output: "Python", solution_code: "word = 'Python'\nprint(word)" },
    { task: "Create two variables x=5 and y=3 and print their sum.", test_input: "", expected_output: "8", solution_code: "x = 5\ny = 3\nprint(x + y)" },
    { task: "Create a variable message = 'Hello World' and print it.", test_input: "", expected_output: "Hello World", solution_code: "message = 'Hello World'\nprint(message)" }
  ],

  infinite_loop: [
    { task: "Print numbers from 1 to 3 using a for loop.", test_input: "", expected_output: "1\n2\n3", solution_code: "for i in range(1, 4):\n    print(i)" },
    { task: "Print numbers from 1 to 5 using a for loop.", test_input: "", expected_output: "1\n2\n3\n4\n5", solution_code: "for i in range(1, 6):\n    print(i)" },
    { task: "Print even numbers from 2 to 8 using a for loop.", test_input: "", expected_output: "2\n4\n6\n8", solution_code: "for i in range(2, 9, 2):\n    print(i)" },
    { task: "Print the word Hi exactly 3 times using a loop.", test_input: "", expected_output: "Hi\nHi\nHi", solution_code: "for _ in range(3):\n    print('Hi')" },
    { task: "Print multiples of 3 from 3 to 15.", test_input: "", expected_output: "3\n6\n9\n12\n15", solution_code: "for i in range(3, 16, 3):\n    print(i)" },
    { task: "Print numbers from 5 down to 1 using a for loop.", test_input: "", expected_output: "5\n4\n3\n2\n1", solution_code: "for i in range(5, 0, -1):\n    print(i)" },
    { task: "Print the letters in the word cat each on a new line.", test_input: "", expected_output: "c\na\nt", solution_code: "for ch in 'cat':\n    print(ch)" }
  ],

  missing_base_case: [
    { task: "Write a function factorial(n) that returns factorial of n. Print factorial(3).", test_input: "", expected_output: "6",
      solution_code: "def factorial(n):\n    if n == 1:\n        return 1\n    return n * factorial(n-1)\n\nprint(factorial(3))" },
    { task: "Write a recursive function to sum numbers from 1 to n. Print sum_to(4).", test_input: "", expected_output: "10",
      solution_code: "def sum_to(n):\n    if n == 1:\n        return 1\n    return n + sum_to(n-1)\n\nprint(sum_to(4))" },
    { task: "Write a recursive function count_down(n) that prints from n to 1. Call count_down(3).", test_input: "", expected_output: "3\n2\n1",
      solution_code: "def count_down(n):\n    if n == 0:\n        return\n    print(n)\n    count_down(n-1)\n\ncount_down(3)" },
    { task: "Write a recursive function to compute 2 to the power of n. Print power(4).", test_input: "", expected_output: "16",
      solution_code: "def power(n):\n    if n == 0:\n        return 1\n    return 2 * power(n-1)\n\nprint(power(4))" },
    { task: "Write a recursive function that returns n + (n-1) + ... + 1. Print triangle(5).", test_input: "", expected_output: "15",
      solution_code: "def triangle(n):\n    if n == 1:\n        return 1\n    return n + triangle(n-1)\n\nprint(triangle(5))" }
  ],

  no_function: [
    { task: "Write a function add(a, b) that returns a+b. Print add(3, 4).", test_input: "", expected_output: "7",
      solution_code: "def add(a, b):\n    return a + b\n\nprint(add(3, 4))" },
    { task: "Write a function that returns double of a number. Print double(5).", test_input: "", expected_output: "10",
      solution_code: "def double(n):\n    return n * 2\n\nprint(double(5))" },
    { task: "Write a function square(n) that returns n*n. Print square(6).", test_input: "", expected_output: "36",
      solution_code: "def square(n):\n    return n * n\n\nprint(square(6))" },
    { task: "Write a function subtract(a,b) that returns a-b. Print subtract(10,3).", test_input: "", expected_output: "7",
      solution_code: "def subtract(a,b):\n    return a - b\n\nprint(subtract(10,3))" },
    { task: "Write a function cube(n) that returns n cubed. Print cube(3).", test_input: "", expected_output: "27",
      solution_code: "def cube(n):\n    return n ** 3\n\nprint(cube(3))" },
    { task: "Write a function is_positive(n) that returns True if n > 0. Print is_positive(5).", test_input: "", expected_output: "True",
      solution_code: "def is_positive(n):\n    return n > 0\n\nprint(is_positive(5))" },
    { task: "Write a function greet(name) that prints Hello name. Call greet('Sam').", test_input: "", expected_output: "Hello Sam",
      solution_code: "def greet(name):\n    print('Hello ' + name)\n\ngreet('Sam')" }
  ],

  missing_print: [
    { task: "Calculate 6 + 3 and print the result.", test_input: "", expected_output: "9", solution_code: "print(6 + 3)" },
    { task: "Calculate 10 - 4 and print the result.", test_input: "", expected_output: "6", solution_code: "print(10 - 4)" },
    { task: "Calculate 5 * 6 and print the result.", test_input: "", expected_output: "30", solution_code: "print(5 * 6)" },
    { task: "Calculate 3 to the power of 4 and print it.", test_input: "", expected_output: "81", solution_code: "print(3 ** 4)" },
    { task: "Print the length of the word hello.", test_input: "", expected_output: "5", solution_code: "print(len('hello'))" },
    { task: "Store the name 'Alice' in a variable and print it.", test_input: "", expected_output: "Alice", solution_code: "name = 'Alice'\nprint(name)" },
    { task: "Calculate 100 divided by 4 and print the result.", test_input: "", expected_output: "25.0", solution_code: "print(100 / 4)" },
    { task: "Write a function multiply(a, b) that returns a*b and print multiply(4, 5).", test_input: "", expected_output: "20",
      solution_code: "def multiply(a, b):\n    return a * b\n\nprint(multiply(4, 5))" },
    { task: "Write a function cube(n) that returns n cubed. Print cube(3).", test_input: "", expected_output: "27",
      solution_code: "def cube(n):\n    return n ** 3\n\nprint(cube(3))" }
  ],

  hardcoded_value: [
    { task: "Print the result of 4 * 5 using the multiplication operator.", test_input: "", expected_output: "20", solution_code: "print(4 * 5)" },
    { task: "Print the result of 8 + 7 using the addition operator.", test_input: "", expected_output: "15", solution_code: "print(8 + 7)" },
    { task: "Compute 2 raised to power 6 using ** and print it.", test_input: "", expected_output: "64", solution_code: "print(2 ** 6)" },
    { task: "Use variables a=12 and b=4 to compute and print a divided by b.", test_input: "", expected_output: "3.0", validationType: "numeric",
      solution_code: "a = 12\nb = 4\nprint(a / b)" },
    { task: "Use a loop to compute and print the sum of 1 to 5.", test_input: "", expected_output: "15",
      solution_code: "total = 0\nfor i in range(1,6):\n    total += i\nprint(total)" },
    { task: "Compute the remainder of 25 divided by 7 using % and print it.", test_input: "", expected_output: "4", solution_code: "print(25 % 7)" },
    { task: "Use variables x=9 and y=3 to print their product.", test_input: "", expected_output: "27",
      solution_code: "x = 9\ny = 3\nprint(x * y)" }
  ],

  idle_stuck: [
    { task: "Print Hello using the print() function.", test_input: "", expected_output: "Hello", solution_code: "print('Hello')" },
    { task: "Create a variable x = 42 and print it.", test_input: "", expected_output: "42", solution_code: "x = 42\nprint(x)" },
    { task: "Print the result of 1 + 1 using the + operator.", test_input: "", expected_output: "2", solution_code: "print(1 + 1)" },
    { task: "Create a variable city = 'London' and print it.", test_input: "", expected_output: "London", solution_code: "city = 'London'\nprint(city)" },
    { task: "Print True if 5 is greater than 3.", test_input: "", expected_output: "True", solution_code: "print(5 > 3)" },
    { task: "Print the first 3 numbers starting from 1.", test_input: "", expected_output: "1\n2\n3",
      solution_code: "for i in range(1,4):\n    print(i)" },
    { task: "Create a variable age = 20 and print it.", test_input: "", expected_output: "20", solution_code: "age = 20\nprint(age)" }
  ]

},

  // ═══════════════════════════════════════════════════════════════════════
  //  INTERMEDIATE — Skill 3-4
  //  Functions, loops, conditionals, list comprehensions, built-ins
  // ═══════════════════════════════════════════════════════════════════════
  Intermediate: {

  logic_error: [
    { task: "Print the sum of all numbers from 1 to 10.", test_input: "", expected_output: "55",
      solution_code: "print(sum(range(1,11)))" },

    { task: "Print whether 17 is prime — True or False.", test_input: "", expected_output: "True",
      solution_code:
`def is_prime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5)+1):
        if n % i == 0:
            return False
    return True

print(is_prime(17))` },

    { task: "Write a function that returns the largest of three numbers. Print largest(3,9,5).", test_input: "", expected_output: "9",
      solution_code:
`def largest(a,b,c):
    return max(a,b,c)

print(largest(3,9,5))` },

    { task: "Print the count of even numbers from 1 to 20.", test_input: "", expected_output: "10",
      solution_code: "print(len([i for i in range(1,21) if i%2==0]))" },

    { task: "Print the average of [4, 8, 15, 16, 23, 42].", test_input: "", expected_output: "18.0",
      solution_code: "nums=[4,8,15,16,23,42]\nprint(sum(nums)/len(nums))" },

    { task: "Write a function to count vowels in a string. Print count_vowels('hello world').", test_input: "", expected_output: "3",
      solution_code:
`def count_vowels(s):
    return sum(1 for c in s if c.lower() in 'aeiou')

print(count_vowels('hello world'))` },

    { task: "Write a function that returns True if a number is divisible by both 2 and 3. Print check(12).", test_input: "", expected_output: "True",
      solution_code:
`def check(n):
    return n%2==0 and n%3==0

print(check(12))` },

    { task: "Create a dictionary with keys 'name' and 'age' with values 'Alice' and 25. Print the name value.", test_input: "", expected_output: "Alice",
      solution_code: "d={'name':'Alice','age':25}\nprint(d['name'])" },

    { task: "Create a dictionary scores = {'math': 90, 'science': 85}. Print the science score.", test_input: "", expected_output: "85",
      solution_code: "scores={'math':90,'science':85}\nprint(scores['science'])" },

    { task: "Create a dictionary and print the number of keys in it. Use {'a':1, 'b':2, 'c':3}.", test_input: "", expected_output: "3",
      solution_code: "d={'a':1,'b':2,'c':3}\nprint(len(d))" },

    { task: "Create a dictionary {'x': 10, 'y': 20} and print the sum of its values.", test_input: "", expected_output: "30",
      solution_code: "d={'x':10,'y':20}\nprint(sum(d.values()))" },

    { task: "Create a tuple (1, 2, 3, 4, 5) and print its length.", test_input: "", expected_output: "5",
      solution_code: "t=(1,2,3,4,5)\nprint(len(t))" },

    { task: "Create a tuple t = (10, 20, 30) and print the second element.", test_input: "", expected_output: "20",
      solution_code: "t=(10,20,30)\nprint(t[1])" },

    { task: "Create a tuple (3, 1, 4, 1, 5) and print its maximum value.", test_input: "", expected_output: "5",
      solution_code: "print(max((3,1,4,1,5)))" },

    { task: "Create a tuple (1, 2, 3) and print the sum of its elements.", test_input: "", expected_output: "6",
      solution_code: "print(sum((1,2,3)))" },

    { task: "Create a set {1, 2, 3, 4, 5} and print its length.", test_input: "", expected_output: "5",
      solution_code: "print(len({1,2,3,4,5}))" },

    { task: "Create two sets {1,2,3} and {3,4,5}. Store their union in a variable and print only the union result (nothing else).", test_input: "", expected_output: "{1, 2, 3, 4, 5}",
      solution_code: "a={1,2,3}\nb={3,4,5}\nprint(a.union(b))" },

    { task: "Create two sets {1,2,3} and {2,3,4}. Store their intersection in a variable and print only the intersection result (nothing else).", test_input: "", expected_output: "{2, 3}",
      solution_code: "a={1,2,3}\nb={2,3,4}\nprint(a.intersection(b))" },

    { task: "Create a list [1,1,2,2,3,3,4] and convert it to a set. Print the length of the set.", test_input: "", expected_output: "4",
      solution_code: "lst=[1,1,2,2,3,3,4]\nprint(len(set(lst)))" },

    { task: "Write a try/except block that catches a ZeroDivisionError when dividing 10 by 0 and prints Cannot divide by zero.", test_input: "", expected_output: "Cannot divide by zero",
      solution_code:
`try:
    print(10/0)
except ZeroDivisionError:
    print("Cannot divide by zero")` },

    { task: "Write a try/except that tries to convert 'abc' to int and prints Invalid number if it fails.", test_input: "", expected_output: "Invalid number",
      solution_code:
`try:
    int('abc')
except:
    print("Invalid number")` },

    { task: "Write a try/except/finally block. In the try block compute 10/2 and print it. In the finally block print Done.", test_input: "", expected_output: "5.0\nDone",
      solution_code:
`try:
    print(10/2)
finally:
    print("Done")` }
  ],

  syntax_error: [
    { task: "Write a function is_even(n) that returns True if n is even. Print is_even(4).", test_input: "", expected_output: "True",
      solution_code: "def is_even(n): return n%2==0\nprint(is_even(4))" },

    { task: "Create a list fruits = ['apple', 'banana', 'cherry'] and print the element at index 1.", test_input: "", expected_output: "banana",
      solution_code: "fruits=['apple','banana','cherry']\nprint(fruits[1])" },

    { task: "Write a for loop that prints each item in [10, 20, 30].", test_input: "", expected_output: "10\n20\n30",
      solution_code: "for i in [10,20,30]: print(i)" },

    { task: "Write a function greet(name) that returns the string 'Hello ' + name. Print greet('World').", test_input: "", expected_output: "Hello World",
      solution_code: "def greet(name): return 'Hello '+name\nprint(greet('World'))" },

    { task: "Write a list comprehension returning squares of 1 to 4 and print it.", test_input: "", expected_output: "[1, 4, 9, 16]",
      solution_code: "print([i*i for i in range(1,5)])" },

    { task: "Create a dictionary {'name': 'Alice'} and print the value of the 'name' key.", test_input: "", expected_output: "Alice",
      solution_code: "print({'name':'Alice'}['name'])" },

    { task: "Write a function that takes a list and returns its length. Print list_len([1,2,3,4]).", test_input: "", expected_output: "4",
      solution_code: "def list_len(lst): return len(lst)\nprint(list_len([1,2,3,4]))" },

    { task: "Create a dictionary student = {'name': 'Bob', 'grade': 'A'}. Print the grade.", test_input: "", expected_output: "A",
      solution_code: "student={'name':'Bob','grade':'A'}\nprint(student['grade'])" },

    { task: "Loop through the keys of {'a': 1, 'b': 2, 'c': 3} and print each key in order (a, b, c).", test_input: "", expected_output: "a\nb\nc",
      solution_code: "for k in {'a':1,'b':2,'c':3}: print(k)" },

    { task: "Unpack the tuple (10, 20, 30) into variables a, b, c and print b.", test_input: "", expected_output: "20",
      solution_code: "a,b,c=(10,20,30)\nprint(b)" },

    { task: "Create a tuple fruits = ('apple', 'banana', 'cherry') and print the element at index 0.", test_input: "", expected_output: "apple",
      solution_code: "fruits=('apple','banana','cherry')\nprint(fruits[0])" }
  ],

  infinite_loop: [
    { task: "Use a while loop to print numbers from 5 down to 1.", test_input: "", expected_output: "5\n4\n3\n2\n1",
      solution_code: "i=5\nwhile i>=1:\n    print(i)\n    i-=1" },

    { task: "Print even numbers from 2 to 10 using a loop.", test_input: "", expected_output: "2\n4\n6\n8\n10",
      solution_code: "for i in range(2,11,2): print(i)" },

    { task: "Use a while loop to print multiples of 4 from 4 to 20.", test_input: "", expected_output: "4\n8\n12\n16\n20",
      solution_code: "i=4\nwhile i<=20:\n    print(i)\n    i+=4" },

    { task: "Print numbers divisible by 7 from 1 to 50.", test_input: "", expected_output: "7\n14\n21\n28\n35\n42\n49",
      solution_code: "for i in range(1,51):\n    if i%7==0: print(i)" },

    { task: "Print all odd numbers from 1 to 15 using a while loop.", test_input: "", expected_output: "1\n3\n5\n7\n9\n11\n13\n15",
      solution_code: "i=1\nwhile i<=15:\n    print(i)\n    i+=2" },

    { task: "Use a loop to print squares of 1 to 5.", test_input: "", expected_output: "1\n4\n9\n16\n25",
      solution_code: "for i in range(1,6): print(i*i)" },

    { task: "Print the multiplication table of 3 from 1 to 5.", test_input: "", expected_output: "3\n6\n9\n12\n15",
      solution_code: "for i in range(1,6): print(3*i)" }
  ],

    missing_base_case: [
  {
    task: "Write a recursive function to compute factorial of 5. Print the result.",
    test_input: "",
    expected_output: "120",
    solution_code:
`def factorial(n):
    if n == 1:
        return 1
    return n * factorial(n-1)

print(factorial(5))`
  },
  {
    task: "Write a recursive function to compute the 6th Fibonacci number. Print it.",
    test_input: "",
    expected_output: "8",
    solution_code:
`def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print(fib(6))`
  },
  {
    task: "Write a recursive function to reverse a string. Print reverse('hello').",
    test_input: "",
    expected_output: "olleh",
    solution_code:
`def reverse(s):
    if s == "":
        return ""
    return s[-1] + reverse(s[:-1])

print(reverse('hello'))`
  },
  {
    task: "Write a recursive function to compute sum of digits of 1234. Print it.",
    test_input: "",
    expected_output: "10",
    solution_code:
`def sum_digits(n):
    if n == 0:
        return 0
    return n % 10 + sum_digits(n // 10)

print(sum_digits(1234))`
  },
  {
    task: "Write a recursive function to find the maximum in a list. Print max_list([3,1,9,2]).",
    test_input: "",
    expected_output: "9",
    solution_code:
`def max_list(lst):
    if len(lst) == 1:
        return lst[0]
    return max(lst[0], max_list(lst[1:]))

print(max_list([3,1,9,2]))`
  },
  {
    task: "Write a recursive countdown(n) that prints each number. Call countdown(4).",
    test_input: "",
    expected_output: "4\n3\n2\n1",
    solution_code:
`def countdown(n):
    if n == 0:
        return
    print(n)
    countdown(n-1)

countdown(4)`
  }
],

no_function: [
  {
    task: "Write a function that checks if 6 is even and print True or False.",
    test_input: "",
    expected_output: "True",
    solution_code:
`def is_even(n):
    return n % 2 == 0

print(is_even(6))`
  },
  {
    task: "Write a function max_of_two(a, b) that returns the larger number. Print max_of_two(3, 7).",
    test_input: "",
    expected_output: "7",
    solution_code:
`def max_of_two(a,b):
    return a if a>b else b

print(max_of_two(3,7))`
  },
  {
    task: "Write a function multiply(a,b) that returns a*b. Print multiply(6,7).",
    test_input: "",
    expected_output: "42",
    solution_code:
`def multiply(a,b):
    return a*b

print(multiply(6,7))`
  },
  {
    task: "Write a function is_palindrome(s) that returns True if palindrome. Print is_palindrome('madam').",
    test_input: "",
    expected_output: "True",
    solution_code:
`def is_palindrome(s):
    return s == s[::-1]

print(is_palindrome('madam'))`
  },
  {
    task: "Write a function sum_list(lst) that returns the sum. Print sum_list([1,2,3,4,5]).",
    test_input: "",
    expected_output: "15",
    solution_code:
`def sum_list(lst):
    return sum(lst)

print(sum_list([1,2,3,4,5]))`
  },
  {
    task: "Write a function to check if a number is divisible by 5. Print div5(25).",
    test_input: "",
    expected_output: "True",
    solution_code:
`def div5(n):
    return n % 5 == 0

print(div5(25))`
  },
  {
    task: "Write a function to return the last element of a list. Print last([10,20,30]).",
    test_input: "",
    expected_output: "30",
    solution_code:
`def last(lst):
    return lst[-1]

print(last([10,20,30]))`
  },
  {
    task: "Write a function print_factors(n) that prints all factors in ascending order from 1 to n. Call print_factors(12).",
    test_input: "",
    expected_output: "1\n2\n3\n4\n6\n12",
    solution_code:
`def print_factors(n):
    for i in range(1,n+1):
        if n%i==0:
            print(i)

print_factors(12)`
  }
],

missing_print: [
  { task: "Write a function to find the square of 9 and print the result.", test_input: "", expected_output: "81",
    solution_code: "print(9**2)" },

  { task: "Compute the length of the string 'hello world' and print it.", test_input: "", expected_output: "11",
    solution_code: "print(len('hello world'))" },

  { task: "Compute the sum of [1,2,3,4,5] using sum() and print it.", test_input: "", expected_output: "15",
    solution_code: "print(sum([1,2,3,4,5]))" },

  { task: "Sort the list [5,2,8,1,9] and print it.", test_input: "", expected_output: "[1, 2, 5, 8, 9]",
    solution_code: "print(sorted([5,2,8,1,9]))" },

  { task: "Reverse the list [1,2,3,4,5] and print it.", test_input: "", expected_output: "[5, 4, 3, 2, 1]",
    solution_code: "print(list(reversed([1,2,3,4,5])))" },

  { task: "Compute the maximum of [3,7,2,9,1] and print it.", test_input: "", expected_output: "9",
    solution_code: "print(max([3,7,2,9,1]))" },

  { task: "Write a function that returns the cube of 4 and print the result.", test_input: "", expected_output: "64",
    solution_code:
`def cube(n):
    return n**3

print(cube(4))` },

  { task: "Create a dictionary {'p': 5, 'q': 10, 'r': 15} and print its values as a list.", test_input: "", expected_output: "[5, 10, 15]",
    solution_code: "print(list({'p':5,'q':10,'r':15}.values()))" },

  { task: "Check if key 'name' exists in {'name': 'Alice', 'age': 25} and print True or False.", test_input: "", expected_output: "True",
    solution_code: "print('name' in {'name':'Alice','age':25})" }
],

hardcoded_value: [
  {
    task: "Print the factorial of 4 by computing it, not hardcoding.",
    test_input: "",
    expected_output: "24",
    solution_code:
`res=1
for i in range(1,5):
    res*=i
print(res)`
  },
  {
    task: "Compute and print 2 raised to the power of 8.",
    test_input: "",
    expected_output: "256",
    solution_code: "print(2**8)"
  },
  {
    task: "Use a loop to compute and print the product of 1 to 5.",
    test_input: "",
    expected_output: "120",
    solution_code:
`res=1
for i in range(1,6):
    res*=i
print(res)`
  },
  {
    task: "Compute the sum of squares of 1 to 4 using a loop and print it.",
    test_input: "",
    expected_output: "30",
    solution_code:
`total=0
for i in range(1,5):
    total+=i*i
print(total)`
  },
  {
    task: "Use range() to compute and print the sum of even numbers from 2 to 10.",
    test_input: "",
    expected_output: "30",
    solution_code: "print(sum(range(2,11,2)))"
  },
  {
    task: "Use a list comprehension to get squares of 1 to 5 and print the sum.",
    test_input: "",
    expected_output: "55",
    solution_code: "print(sum([i*i for i in range(1,6)]))"
  },
  {
    task: "Compute the GCD of 48 and 18 using a function and print it.",
    test_input: "",
    expected_output: "6",
    solution_code:
`def gcd(a,b):
    while b:
        a,b=b,a%b
    return a

print(gcd(48,18))`
  }
],

idle_stuck: [
  { task: "Print all odd numbers between 1 and 9.", test_input: "", expected_output: "1\n3\n5\n7\n9",
    solution_code: "for i in range(1,10,2): print(i)" },

  { task: "Print the square of numbers 1 to 4.", test_input: "", expected_output: "1\n4\n9\n16",
    solution_code: "for i in range(1,5): print(i*i)" },

  { task: "Print the first 5 multiples of 6.", test_input: "", expected_output: "6\n12\n18\n24\n30",
    solution_code: "for i in range(1,6): print(6*i)" },

  { task: "Write a function that takes a name and prints Hello name. Call it with 'Alice'.", test_input: "", expected_output: "Hello Alice",
    solution_code:
`def greet(name):
    print("Hello " + name)

greet("Alice")` },

  { task: "Print the sum of the first 5 even numbers.", test_input: "", expected_output: "30",
    solution_code: "print(sum(range(2,11,2)))" },

  { task: "Print numbers from 1 to 10 that are not divisible by 3.", test_input: "", expected_output: "1\n2\n4\n5\n7\n8\n10",
    solution_code:
`for i in range(1,11):
    if i%3!=0:
        print(i)` },

  { task: "Print True if the list [1,2,3] has length 3.", test_input: "", expected_output: "True",
    solution_code: "print(len([1,2,3])==3)" }
]
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  ADVANCED — Skill 5
  //  Recursion, OOP, decorators, generators, algorithms
  // ═══════════════════════════════════════════════════════════════════════
  Advanced: {

    logic_error: [

{
  task: "Print all prime numbers between 1 and 20.",
  expected_output: "2\n3\n5\n7\n11\n13\n17\n19",
  solution: `
for num in range(2, 21):
    for i in range(2, num):
        if num % i == 0:
            break
    else:
        print(num)
`
},

{
  task: "Compute the GCD of 48 and 18 using a function and print the result.",
  expected_output: "6",
  solution: `
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

print(gcd(48, 18))
`
},

{
  task: "Write a function to check if a number is perfect. Print is_perfect(28).",
  expected_output: "True",
  solution: `
def is_perfect(n):
    total = 0
    for i in range(1, n):
        if n % i == 0:
            total += i
    return total == n

print(is_perfect(28))
`
},

{
  task: "Write a binary search function. Print bsearch([1,2,3,4,5,6,7],5).",
  expected_output: "4",
  solution: `
def bsearch(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

print(bsearch([1,2,3,4,5,6,7], 5))
`
},

{
  task: "Compute the LCM of 12 and 18 using a function and print the result.",
  expected_output: "36",
  solution: `
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return (a * b) // gcd(a, b)

print(lcm(12, 18))
`
},

{
  task: "Print the sum of all prime numbers between 1 and 20.",
  expected_output: "77",
  solution: `
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True

total = 0
for i in range(1, 21):
    if is_prime(i):
        total += i

print(total)
`
},

{
  task: "Write a function to find the second largest in a list. Print second_largest([3,1,9,7,5]).",
  expected_output: "7",
  solution: `
def second_largest(lst):
    lst = list(set(lst))
    lst.sort()
    return lst[-2]

print(second_largest([3,1,9,7,5]))
`
},

{
  task: "Write a class Animal with a speak method returning 'Generic sound'. Write a class Dog that inherits Animal and overrides speak to return 'Woof'. Print Dog().speak().",
  expected_output: "Woof",
  solution: `
class Animal:
    def speak(self):
        return "Generic sound"

class Dog(Animal):
    def speak(self):
        return "Woof"

print(Dog().speak())
`
},

{
  task: "Write a class Shape with an area method returning 0. Write a class Square inheriting Shape that overrides area to return side*side where side=4. Print Square().area().",
  expected_output: "16",
  solution: `
class Shape:
    def area(self):
        return 0

class Square(Shape):
    def __init__(self):
        self.side = 4

    def area(self):
        return self.side * self.side

print(Square().area())
`
},

{
  task: "Write a parent class Vehicle with a method type() returning 'Vehicle'. Write a child class Car that overrides type() to return 'Car'. Print Car().type().",
  expected_output: "Car",
  solution: `
class Vehicle:
    def type(self):
        return "Vehicle"

class Car(Vehicle):
    def type(self):
        return "Car"

print(Car().type())
`
}

],

    syntax_error: [

{
  task: "Write a class Rectangle with width=4 and height=5. Print its area.",
  expected_output: "20",
  solution: `
class Rectangle:
    def __init__(self):
        self.width = 4
        self.height = 5

    def area(self):
        return self.width * self.height

print(Rectangle().area())
`
},

{
  task: "Write a list comprehension to get squares of 1 to 5 and print it.",
  expected_output: "[1, 4, 9, 16, 25]",
  solution: `
print([i*i for i in range(1,6)])
`
},

{
  task: "Write a generator that yields numbers 1 to 5. Print each value.",
  expected_output: "1\n2\n3\n4\n5",
  solution: `
def gen():
    for i in range(1,6):
        yield i

for x in gen():
    print(x)
`
},

{
  task: "Write a lambda function that returns the square of a number. Print it applied to 7.",
  expected_output: "49",
  solution: `
square = lambda x: x*x
print(square(7))
`
},

{
  task: "Write a class Stack with push and pop methods. Push 1,2,3 then pop and print.",
  expected_output: "3",
  solution: `
class Stack:
    def __init__(self):
        self.s = []

    def push(self, x):
        self.s.append(x)

    def pop(self):
        return self.s.pop()

st = Stack()
st.push(1)
st.push(2)
st.push(3)
print(st.pop())
`
},

{
  task: "Write a class Circle with radius=7. Print its area rounded to 2 decimals.",
  expected_output: "153.94",
  solution: `
import math
print(round(math.pi * 7 * 7, 2))
`
},

{
  task: "Write a decorator that prints 'Start' before a function runs. Apply it to a function that prints 'Hello'.",
  expected_output: "Start\nHello",
  solution: `
def deco(func):
    def wrapper():
        print("Start")
        func()
    return wrapper

@deco
def hello():
    print("Hello")

hello()
`
},

{
  task: "Write a generator function gen_nums() that yields 1,2,3,4,5. Print each value using a for loop.",
  expected_output: "1\n2\n3\n4\n5",
  solution: `
def gen_nums():
    for i in range(1,6):
        yield i

for x in gen_nums():
    print(x)
`
},

{
  task: "Write a generator function squares() that yields squares of 1,2,3,4,5. Print each yielded value.",
  expected_output: "1\n4\n9\n16\n25",
  solution: `
def squares():
    for i in range(1,6):
        yield i*i

for x in squares():
    print(x)
`
},

{
  task: "Write a generator function evens() that yields 2,4,6,8,10. Print each value.",
  expected_output: "2\n4\n6\n8\n10",
  solution: `
def evens():
    for i in range(2,11,2):
        yield i

for x in evens():
    print(x)
`
},

{
  task: "Write a decorator that prints 'Before' and 'After' around a function that prints 'Running'.",
  expected_output: "Before\nRunning\nAfter",
  solution: `
def deco(func):
    def wrapper():
        print("Before")
        func()
        print("After")
    return wrapper

@deco
def run():
    print("Running")

run()
`
}

],

    infinite_loop: [

{
  task: "Use binary search to find index of 7 in [1,3,5,7,9]. Print the index.",
  expected_output: "3",
  solution: `
def bsearch(arr, target):
    l, r = 0, len(arr)-1
    while l <= r:
        m = (l+r)//2
        if arr[m] == target:
            return m
        elif arr[m] < target:
            l = m+1
        else:
            r = m-1

print(bsearch([1,3,5,7,9],7))
`
},

{
  task: "Print the first 8 Fibonacci numbers.",
  expected_output: "0\n1\n1\n2\n3\n5\n8\n13",
  solution: `
a, b = 0, 1
for _ in range(8):
    print(a)
    a, b = b, a+b
`
},

{
  task: "Implement bubble sort and print the sorted version of [5,3,8,1,2].",
  expected_output: "[1, 2, 3, 5, 8]",
  solution: `
arr = [5,3,8,1,2]
for i in range(len(arr)):
    for j in range(len(arr)-1-i):
        if arr[j] > arr[j+1]:
            arr[j], arr[j+1] = arr[j+1], arr[j]
print(arr)
`
},

{
  task: "Implement selection sort and print the sorted version of [64,25,12,22,11].",
  expected_output: "[11, 12, 22, 25, 64]",
  solution: `
arr = [64,25,12,22,11]
for i in range(len(arr)):
    min_i = i
    for j in range(i+1,len(arr)):
        if arr[j] < arr[min_i]:
            min_i = j
    arr[i], arr[min_i] = arr[min_i], arr[i]
print(arr)
`
},

{
  task: "Print all armstrong numbers between 1 and 500.",
  expected_output: "1\n153\n370\n371\n407",
  solution: `
for num in range(1,501):
    s = sum(int(d)**len(str(num)) for d in str(num))
    if s == num:
        print(num)
`
},

{
  task: "Use a while loop to find and print the 10th Fibonacci number.",
  expected_output: "34",
  solution: `
a, b = 0, 1
count = 0
while count < 10:
    a, b = b, a+b
    count += 1
print(a)
`
},

{
  task: "Print all perfect numbers between 1 and 500.",
  expected_output: "6\n28\n496",
  solution: `
for n in range(1,501):
    if sum(i for i in range(1,n) if n%i==0) == n:
        print(n)
`
}

],

    missing_base_case: [

{
  task: "Write a recursive binary search. Search for 5 in [1,2,3,4,5,6]. Print its index.",
  expected_output: "4",
  solution: `
def bsearch(arr, target, l, r):
    if l > r:
        return -1
    mid = (l+r)//2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return bsearch(arr, target, mid+1, r)
    else:
        return bsearch(arr, target, l, mid-1)

print(bsearch([1,2,3,4,5,6],5,0,5))
`
},

{
  task: "Write a recursive power function. Print power(2, 10).",
  expected_output: "1024",
  solution: `
def power(a, b):
    if b == 0:
        return 1
    return a * power(a, b-1)

print(power(2,10))
`
},

{
  task: "Write a recursive function to compute the nth Fibonacci. Print fib(10).",
  expected_output: "55",
  solution: `
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print(fib(10))
`
},

{
  task: "Write a recursive function to check if a list is sorted. Print is_sorted([1,2,3,4]).",
  expected_output: "True",
  solution: `
def is_sorted(lst):
    if len(lst) <= 1:
        return True
    return lst[0] <= lst[1] and is_sorted(lst[1:])

print(is_sorted([1,2,3,4]))
`
},

{
  task: "Write a recursive merge sort and print sorted [38,27,43,3,9].",
  expected_output: "[3, 9, 27, 38, 43]",
  solution: `
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr)//2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    res = []
    while left and right:
        if left[0] < right[0]:
            res.append(left.pop(0))
        else:
            res.append(right.pop(0))
    return res + left + right

print(merge_sort([38,27,43,3,9]))
`
},

{
  task: "Write a recursive function to flatten a nested list [[1,2],[3,4]]. Print the result.",
  expected_output: "[1, 2, 3, 4]",
  solution: `
def flatten(lst):
    res = []
    for i in lst:
        if isinstance(i, list):
            res.extend(flatten(i))
        else:
            res.append(i)
    return res

print(flatten([[1,2],[3,4]]))
`
}

],

    no_function: [

{
  task: "Write a function that returns the nth Fibonacci number recursively. Print fib(7).",
  expected_output: "13",
  solution: `
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print(fib(7))
`
},

{
  task: "Write a function is_palindrome(s). Print is_palindrome('racecar').",
  expected_output: "True",
  solution: `
def is_palindrome(s):
    return s == s[::-1]

print(is_palindrome("racecar"))
`
},

{
  task: "Write a recursive function to compute GCD. Print gcd(48,18).",
  expected_output: "6",
  solution: `
def gcd(a, b):
    if b == 0:
        return a
    return gcd(b, a % b)

print(gcd(48,18))
`
},

{
  task: "Write a function to rotate a list left by k positions. Print rotate([1,2,3,4,5],2).",
  expected_output: "[3, 4, 5, 1, 2]",
  solution: `
def rotate(lst, k):
    return lst[k:] + lst[:k]

print(rotate([1,2,3,4,5], 2))
`
},

{
  task: "Write a function to check if two strings are anagrams. Print is_anagram('listen','silent').",
  expected_output: "True",
  solution: `
def is_anagram(a, b):
    return sorted(a) == sorted(b)

print(is_anagram("listen", "silent"))
`
},

{
  task: "Write a function that returns all prime factors of a number. Print prime_factors(60).",
  expected_output: "[2, 2, 3, 5]",
  solution: `
def prime_factors(n):
    factors = []
    i = 2
    while i * i <= n:
        while n % i == 0:
            factors.append(i)
            n //= i
        i += 1
    if n > 1:
        factors.append(n)
    return factors

print(prime_factors(60))
`
},

{
  task: "Write a function to perform binary search. Print bsearch([1,3,5,7,9,11],7).",
  expected_output: "3",
  solution: `
def bsearch(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

print(bsearch([1,3,5,7,9,11], 7))
`
},

{
  task: "Create a lambda function that returns the square of a number. Print it applied to 7.",
  expected_output: "49",
  solution: `
square = lambda x: x * x
print(square(7))
`
},

{
  task: "Create a lambda function that adds two numbers. Print it applied to 3 and 4.",
  expected_output: "7",
  solution: `
add = lambda a, b: a + b
print(add(3,4))
`
},

{
  task: "Use a lambda with sorted() to sort the list ['banana','apple','cherry'] alphabetically and print the result.",
  expected_output: "['apple', 'banana', 'cherry']",
  solution: `
fruits = ['banana','apple','cherry']
print(sorted(fruits, key=lambda x: x))
`
},

{
  task: "Use a lambda with filter() to keep only even numbers from [1,2,3,4,5,6]. Print the result as a list.",
  expected_output: "[2, 4, 6]",
  solution: `
nums = [1,2,3,4,5,6]
print(list(filter(lambda x: x % 2 == 0, nums)))
`
},

{
  task: "Use a lambda with map() to square each element of [1,2,3,4]. Print the result as a list.",
  expected_output: "[1, 4, 9, 16]",
  solution: `
nums = [1,2,3,4]
print(list(map(lambda x: x*x, nums)))
`
}

],

missing_print: [

{
  task: "Compute the sum of squares of numbers from 1 to 5 and print it.",
  expected_output: "55",
  solution: `
total = sum(i*i for i in range(1,6))
print(total)
`
},

{
  task: "Count vowels in 'programming' and print the count.",
  expected_output: "3",
  solution: `
s = "programming"
count = sum(1 for c in s if c in "aeiou")
print(count)
`
},

{
  task: "Write a recursive factorial function and print factorial(7).",
  expected_output: "5040",
  solution: `
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n-1)

print(factorial(7))
`
},

{
  task: "Compute and print the dot product of [1,2,3] and [4,5,6].",
  expected_output: "32",
  solution: `
a = [1,2,3]
b = [4,5,6]
dot = sum(x*y for x,y in zip(a,b))
print(dot)
`
},

{
  task: "Compute and print the sum of all digits in 987654.",
  expected_output: "39",
  solution: `
num = 987654
total = sum(int(d) for d in str(num))
print(total)
`
},

{
  task: "Find and print all factors of 36 in ascending order.",
  expected_output: "1\n2\n3\n4\n6\n9\n12\n18\n36",
  solution: `
n = 36
for i in range(1, n+1):
    if n % i == 0:
        print(i)
`
},

{
  task: "Compute and print the sum of digits of 12345.",
  expected_output: "15",
  solution: `
num = 12345
total = sum(int(d) for d in str(num))
print(total)
`
}

],

    hardcoded_value: [

{
  task: "Print the factorial of 6 by writing the computation, not the answer.",
  expected_output: "720",
  solution: `
res = 1
for i in range(1, 7):
    res *= i
print(res)
`
},

{
  task: "Compute and print the sum of digits of 12345.",
  expected_output: "15",
  solution: `
num = 12345
total = 0
while num > 0:
    total += num % 10
    num //= 10
print(total)
`
},

{
  task: "Compute 2 to the power of 10 using recursion and print it.",
  expected_output: "1024",
  solution: `
def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)

print(power(2, 10))
`
},

{
  task: "Use a loop to compute and print the product of all numbers from 1 to 7.",
  expected_output: "5040",
  solution: `
product = 1
for i in range(1, 8):
    product *= i
print(product)
`
},

{
  task: "Use recursion to compute and print the GCD of 56 and 98.",
  expected_output: "14",
  solution: `
def gcd(a, b):
    if b == 0:
        return a
    return gcd(b, a % b)

print(gcd(56, 98))
`
},

{
  task: "Compute and print the number of digits in 123456789 using a loop.",
  expected_output: "9",
  solution: `
num = 123456789
count = 0
while num > 0:
    count += 1
    num //= 10
print(count)
`
},

{
  task: "Compute the sum of the first 20 fibonacci numbers using a loop and print it.",
  expected_output: "10945",
  solution: `
a, b = 0, 1
total = 0

for _ in range(20):
    total += a
    a, b = b, a + b

print(total)
`
}

],

    idle_stuck: [

{
  task: "Write a function to reverse a string. Print reverse('python').",
  expected_output: "nohtyp",
  solution: `
def reverse(s):
    return s[::-1]

print(reverse("python"))
`
},

{
  task: "Print the largest element in [3, 1, 4, 1, 5, 9, 2, 6].",
  expected_output: "9",
  solution: `
lst = [3, 1, 4, 1, 5, 9, 2, 6]
print(max(lst))
`
},

{
  task: "Write a function to check if a number is prime. Print is_prime(29).",
  expected_output: "True",
  solution: `
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

print(is_prime(29))
`
},

{
  task: "Implement and print the result of bubble sorting [4,2,7,1,3].",
  expected_output: "[1, 2, 3, 4, 7]",
  solution: `
arr = [4,2,7,1,3]

for i in range(len(arr)):
    for j in range(0, len(arr)-i-1):
        if arr[j] > arr[j+1]:
            arr[j], arr[j+1] = arr[j+1], arr[j]

print(arr)
`
},

{
  task: "Write a generator yielding squares of 1 to 5 and print each.",
  expected_output: "1\n4\n9\n16\n25",
  solution: `
def gen_squares():
    for i in range(1,6):
        yield i*i

for x in gen_squares():
    print(x)
`
},

{
  task: "Write a class Animal with a speak method returning 'Roar'. Print Animal().speak().",
  expected_output: "Roar",
  solution: `
class Animal:
    def speak(self):
        return "Roar"

print(Animal().speak())
`
},

{
  task: "Find and print the most frequent element in [1,2,2,3,3,3,4].",
  expected_output: "3",
  solution: `
lst = [1,2,2,3,3,3,4]

freq = {}
for num in lst:
    freq[num] = freq.get(num, 0) + 1

most_freq = max(freq, key=freq.get)
print(most_freq)
`
}

]
  }
};
