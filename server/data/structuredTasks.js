export const structuredTasks = {

  // ═══════════════════════════════════════════════════════════════════════
  //  BEGINNER — Skill 1-2
  //  Only: print(), variables, basic math, simple loops, basic if/else
  // ═══════════════════════════════════════════════════════════════════════
  Beginner: {

    logic_error: [
      { task: "Print the sum of 5 and 10.", test_input: "", expected_output: "15" },
      { task: "Print the result of 3 multiplied by 4.", test_input: "", expected_output: "12" },
      { task: "Print the result of 20 minus 8.", test_input: "", expected_output: "12" },
      { task: "Store 6 and 7 in variables a and b, then print their product.", test_input: "", expected_output: "42" },
      { task: "Print the result of 2 raised to the power of 5.", test_input: "", expected_output: "32" },
      { task: "Print the remainder of 17 divided by 5.", test_input: "", expected_output: "2" },
      { task: "Print the result of 100 divided by 4.", test_input: "", expected_output: "25.0" },
      { task: "Write a function is_odd(n) that returns True if n is odd. Print is_odd(7).", test_input: "", expected_output: "True" },
      { task: "Write a function max_of_two(a, b) that returns the larger number. Print max_of_two(4, 9).", test_input: "", expected_output: "9" },
      { task: "Write a function absolute(n) that returns the absolute value. Print absolute(-5).", test_input: "", expected_output: "5" }
    ],

    syntax_error: [
      { task: "Create a variable x = 10 and print it.", test_input: "", expected_output: "10" },
      { task: "Create a variable name = 'Alice' and print it.", test_input: "", expected_output: "Alice" },
      { task: "Create a variable pi = 3.14 and print it.", test_input: "", expected_output: "3.14" },
      { task: "Create a variable age = 20 and print it.", test_input: "", expected_output: "20" },
      { task: "Store the word Python in a variable and print it.", test_input: "", expected_output: "Python" },
      { task: "Create two variables x=5 and y=3 and print their sum.", test_input: "", expected_output: "8" },
      { task: "Print the string Hello World.", test_input: "", expected_output: "Hello World" }
    ],

    infinite_loop: [
      { task: "Print numbers from 1 to 3 using a for loop.", test_input: "", expected_output: "1\n2\n3" },
      { task: "Print numbers from 1 to 5 using a for loop.", test_input: "", expected_output: "1\n2\n3\n4\n5" },
      { task: "Print even numbers from 2 to 8 using a for loop.", test_input: "", expected_output: "2\n4\n6\n8" },
      { task: "Print the word Hi exactly 3 times using a loop.", test_input: "", expected_output: "Hi\nHi\nHi" },
      { task: "Print multiples of 3 from 3 to 15.", test_input: "", expected_output: "3\n6\n9\n12\n15" },
      { task: "Print numbers from 5 down to 1 using a for loop.", test_input: "", expected_output: "5\n4\n3\n2\n1" },
      { task: "Print the letters in the word cat each on a new line.", test_input: "", expected_output: "c\na\nt" }
    ],

    missing_base_case: [
      { task: "Write a function factorial(n) that returns factorial of n. Print factorial(3).", test_input: "", expected_output: "6" },
      { task: "Write a recursive function to sum numbers from 1 to n. Print sum_to(4).", test_input: "", expected_output: "10" },
      { task: "Write a recursive function count_down(n) that prints from n to 1. Call count_down(3).", test_input: "", expected_output: "3\n2\n1" },
      { task: "Write a recursive function to compute 2 to the power of n. Print power(4).", test_input: "", expected_output: "16" },
      { task: "Write a recursive function that returns n + (n-1) + ... + 1. Print triangle(5).", test_input: "", expected_output: "15" }
    ],

    no_function: [
      { task: "Write a function add(a, b) that returns a+b. Print add(3, 4).", test_input: "", expected_output: "7" },
      { task: "Write a function that returns double of a number. Print double(5).", test_input: "", expected_output: "10" },
      { task: "Write a function square(n) that returns n*n. Print square(6).", test_input: "", expected_output: "36" },
      { task: "Write a function subtract(a,b) that returns a-b. Print subtract(10,3).", test_input: "", expected_output: "7" },
      { task: "Write a function cube(n) that returns n cubed. Print cube(3).", test_input: "", expected_output: "27" },
      { task: "Write a function is_positive(n) that returns True if n > 0. Print is_positive(5).", test_input: "", expected_output: "True" },
      { task: "Write a function greet(name) that prints Hello name. Call greet('Sam').", test_input: "", expected_output: "Hello Sam" }
    ],

    missing_print: [
      { task: "Calculate 6 + 3 and print the result.", test_input: "", expected_output: "9" },
      { task: "Calculate 10 - 4 and print the result.", test_input: "", expected_output: "6" },
      { task: "Calculate 5 * 6 and print the result.", test_input: "", expected_output: "30" },
      { task: "Calculate 3 to the power of 4 and print it.", test_input: "", expected_output: "81" },
      { task: "Print the length of the word hello.", test_input: "", expected_output: "5" },
      { task: "Store your name in a variable and print it.", test_input: "", expected_output: "Alice" },
      { task: "Calculate 100 divided by 4 and print the result.", test_input: "", expected_output: "25.0" },
      { task: "Write a function multiply(a, b) that returns a*b and print multiply(4, 5).", test_input: "", expected_output: "20" },
      { task: "Write a function cube(n) that returns n cubed. Print cube(3).", test_input: "", expected_output: "27" }
    ],

    hardcoded_value: [
      { task: "Print the result of 4 * 5 using the multiplication operator.", test_input: "", expected_output: "20" },
      { task: "Print the result of 8 + 7 using the addition operator.", test_input: "", expected_output: "15" },
      { task: "Compute 2 raised to power 6 using ** and print it.", test_input: "", expected_output: "64" },
      { task: "Use variables a=12 and b=4 to compute and print a divided by b.", test_input: "", expected_output: "3.0" },
      { task: "Use a loop to compute and print the sum of 1 to 5.", test_input: "", expected_output: "15" },
      { task: "Compute the remainder of 25 divided by 7 using % and print it.", test_input: "", expected_output: "4" },
      { task: "Use variables x=9 and y=3 to print their product.", test_input: "", expected_output: "27" }
    ],

    idle_stuck: [
      { task: "Print the word Hello.", test_input: "", expected_output: "Hello" },
      { task: "Print the number 42.", test_input: "", expected_output: "42" },
      { task: "Print the result of 1 + 1.", test_input: "", expected_output: "2" },
      { task: "Create a variable city = 'London' and print it.", test_input: "", expected_output: "London" },
      { task: "Print True if 5 is greater than 3.", test_input: "", expected_output: "True" },
      { task: "Print the first 3 numbers starting from 1.", test_input: "", expected_output: "1\n2\n3" },
      { task: "Print your age as a number.", test_input: "", expected_output: "20" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  INTERMEDIATE — Skill 3-4
  //  Functions, loops, conditionals, list comprehensions, built-ins
  // ═══════════════════════════════════════════════════════════════════════
  Intermediate: {

    logic_error: [
      { task: "Print the sum of all numbers from 1 to 10.", test_input: "", expected_output: "55" },
      { task: "Print whether 17 is prime — True or False.", test_input: "", expected_output: "True" },
      { task: "Write a function that returns the largest of three numbers. Print largest(3,9,5).", test_input: "", expected_output: "9" },
      { task: "Print the count of even numbers from 1 to 20.", test_input: "", expected_output: "10" },
      { task: "Print the average of [4, 8, 15, 16, 23, 42].", test_input: "", expected_output: "18.0" },
      { task: "Write a function to count vowels in a string. Print count_vowels('hello world').", test_input: "", expected_output: "3" },
      { task: "Write a function that returns True if a number is divisible by both 2 and 3. Print check(12).", test_input: "", expected_output: "True" },
      { task: "Create a dictionary with keys 'name' and 'age' with values 'Alice' and 25. Print the name value.", test_input: "", expected_output: "Alice" },
      { task: "Create a dictionary scores = {'math': 90, 'science': 85}. Print the science score.", test_input: "", expected_output: "85" },
      { task: "Create a dictionary and print the number of keys in it. Use {'a':1, 'b':2, 'c':3}.", test_input: "", expected_output: "3" },
      { task: "Create a dictionary {'x': 10, 'y': 20} and print the sum of its values.", test_input: "", expected_output: "30" },
      //tuples at Intermediate level
      { task: "Create a tuple (1, 2, 3, 4, 5) and print its length.", test_input: "", expected_output: "5" },
      { task: "Create a tuple t = (10, 20, 30) and print the second element.", test_input: "", expected_output: "20" },
      { task: "Create a tuple (3, 1, 4, 1, 5) and print its maximum value.", test_input: "", expected_output: "5" },
      { task: "Create a tuple (1, 2, 3) and print the sum of its elements.", test_input: "", expected_output: "6" },
      //sets at Intermediate level
      { task: "Create a set {1, 2, 3, 4, 5} and print its length.", test_input: "", expected_output: "5" },
      { task: "Create two sets {1,2,3} and {3,4,5} and print their union.", test_input: "", expected_output: "{1, 2, 3, 4, 5}" },
      { task: "Create two sets {1,2,3} and {2,3,4} and print their intersection.", test_input: "", expected_output: "{2, 3}" },
      { task: "Create a list [1,1,2,2,3,3,4] and convert it to a set. Print the length of the set.", test_input: "", expected_output: "4" },
      //exception handling at Intermediate level
      { task: "Write a try/except block that catches a ZeroDivisionError when dividing 10 by 0 and prints Cannot divide by zero.", test_input: "", expected_output: "Cannot divide by zero" },
      { task: "Write a try/except that tries to convert 'abc' to int and prints Invalid number if it fails.", test_input: "", expected_output: "Invalid number" },
      { task: "Write a try/except/finally block. Try to print 10/2 and print Done in finally.", test_input: "", expected_output: "5.0\nDone" }
    ],

    syntax_error: [
      { task: "Write a function is_even(n) that returns True if n is even. Print is_even(4).", test_input: "", expected_output: "True" },
      { task: "Write a list of 3 fruits and print the second one.", test_input: "", expected_output: "banana" },
      { task: "Write a for loop that prints each item in [10, 20, 30].", test_input: "", expected_output: "10\n20\n30" },
      { task: "Write a function greet(name) returning 'Hello name'. Print greet('World').", test_input: "", expected_output: "Hello World" },
      { task: "Write a list comprehension returning squares of 1 to 4 and print it.", test_input: "", expected_output: "[1, 4, 9, 16]" },
      { task: "Create a dictionary with key name='Alice' and print the name value.", test_input: "", expected_output: "Alice" },
      { task: "Write a function that takes a list and returns its length. Print list_len([1,2,3,4]).", test_input: "", expected_output: "4" },
      { task: "Create a dictionary student = {'name': 'Bob', 'grade': 'A'}. Print the grade.", test_input: "", expected_output: "A" },
      { task: "Loop through the keys of {'a': 1, 'b': 2, 'c': 3} and print each key.", test_input: "", expected_output: "a\nb\nc" },
      //Missing: tuples at Intermediate level
      { task: "Unpack the tuple (10, 20, 30) into variables a, b, c and print b.", test_input: "", expected_output: "20" },
      { task: "Create a tuple of 3 fruits and print the first fruit.", test_input: "", expected_output: "apple" }
    ],

    infinite_loop: [
      { task: "Use a while loop to print numbers from 5 down to 1.", test_input: "", expected_output: "5\n4\n3\n2\n1" },
      { task: "Print even numbers from 2 to 10 using a loop.", test_input: "", expected_output: "2\n4\n6\n8\n10" },
      { task: "Use a while loop to print multiples of 4 from 4 to 20.", test_input: "", expected_output: "4\n8\n12\n16\n20" },
      { task: "Print numbers divisible by 7 from 1 to 50.", test_input: "", expected_output: "7\n14\n21\n28\n35\n42\n49" },
      { task: "Print all odd numbers from 1 to 15 using a while loop.", test_input: "", expected_output: "1\n3\n5\n7\n9\n11\n13\n15" },
      { task: "Use a loop to print squares of 1 to 5.", test_input: "", expected_output: "1\n4\n9\n16\n25" },
      { task: "Print the multiplication table of 3 from 1 to 5.", test_input: "", expected_output: "3\n6\n9\n12\n15" }
    ],

    missing_base_case: [
      { task: "Write a recursive function to compute factorial of 5. Print the result.", test_input: "", expected_output: "120" },
      { task: "Write a recursive function to compute the 6th Fibonacci number. Print it.", test_input: "", expected_output: "8" },
      { task: "Write a recursive function to reverse a string. Print reverse('hello').", test_input: "", expected_output: "olleh" },
      { task: "Write a recursive function to compute sum of digits of 1234. Print it.", test_input: "", expected_output: "10" },
      { task: "Write a recursive function to find the maximum in a list. Print max_list([3,1,9,2]).", test_input: "", expected_output: "9" },
      { task: "Write a recursive countdown(n) that prints each number. Call countdown(4).", test_input: "", expected_output: "4\n3\n2\n1" }
    ],

    no_function: [
      { task: "Write a function that checks if 6 is even and print True or False.", test_input: "", expected_output: "True" },
      { task: "Write a function max_of_two(a, b) that returns the larger number. Print max_of_two(3, 7).", test_input: "", expected_output: "7" },
      { task: "Write a function multiply(a,b) that returns a*b. Print multiply(6,7).", test_input: "", expected_output: "42" },
      { task: "Write a function is_palindrome(s) that returns True if palindrome. Print is_palindrome('madam').", test_input: "", expected_output: "True" },
      { task: "Write a function sum_list(lst) that returns the sum. Print sum_list([1,2,3,4,5]).", test_input: "", expected_output: "15" },
      { task: "Write a function to check if a number is divisible by 5. Print div5(25).", test_input: "", expected_output: "True" },
      { task: "Write a function to return the last element of a list. Print last([10,20,30]).", test_input: "", expected_output: "30" },
      { task: "Write a function print_factors(n) that prints all factors. Call print_factors(12).", test_input: "", expected_output: "1\n2\n3\n4\n6\n12" }
    ],

    missing_print: [
      { task: "Write a function to find the square of 9 and print the result.", test_input: "", expected_output: "81" },
      { task: "Compute the length of the string 'hello world' and print it.", test_input: "", expected_output: "11" },
      { task: "Compute the sum of [1,2,3,4,5] using sum() and print it.", test_input: "", expected_output: "15" },
      { task: "Sort the list [5,2,8,1,9] and print it.", test_input: "", expected_output: "[1, 2, 5, 8, 9]" },
      { task: "Reverse the list [1,2,3,4,5] and print it.", test_input: "", expected_output: "[5, 4, 3, 2, 1]" },
      { task: "Compute the maximum of [3,7,2,9,1] and print it.", test_input: "", expected_output: "9" },
      { task: "Write a function that returns the cube of 4 and print the result.", test_input: "", expected_output: "64" },
      { task: "Create a dictionary {'p': 5, 'q': 10, 'r': 15} and print its values as a list.", test_input: "", expected_output: "[5, 10, 15]" },
      { task: "Check if key 'name' exists in {'name': 'Alice', 'age': 25} and print True or False.", test_input: "", expected_output: "True" }
    ],

    hardcoded_value: [
      { task: "Print the factorial of 4 by computing it, not hardcoding.", test_input: "", expected_output: "24" },
      { task: "Compute and print 2 raised to the power of 8.", test_input: "", expected_output: "256" },
      { task: "Use a loop to compute and print the product of 1 to 5.", test_input: "", expected_output: "120" },
      { task: "Compute the sum of squares of 1 to 4 using a loop and print it.", test_input: "", expected_output: "30" },
      { task: "Use range() to compute and print the sum of even numbers from 2 to 10.", test_input: "", expected_output: "30" },
      { task: "Use a list comprehension to get squares of 1 to 5 and print the sum.", test_input: "", expected_output: "55" },
      { task: "Compute the GCD of 48 and 18 using a function and print it.", test_input: "", expected_output: "6" }
    ],

    idle_stuck: [
      { task: "Print all odd numbers between 1 and 9.", test_input: "", expected_output: "1\n3\n5\n7\n9" },
      { task: "Print the square of numbers 1 to 4.", test_input: "", expected_output: "1\n4\n9\n16" },
      { task: "Print the first 5 multiples of 6.", test_input: "", expected_output: "6\n12\n18\n24\n30" },
      { task: "Write a function that takes a name and prints Hello name. Call it with 'Alice'.", test_input: "", expected_output: "Hello Alice" },
      { task: "Print the sum of the first 5 even numbers.", test_input: "", expected_output: "30" },
      { task: "Print numbers from 1 to 10 that are not divisible by 3.", test_input: "", expected_output: "1\n2\n4\n5\n7\n8\n10" },
      { task: "Print True if the list [1,2,3] has length 3.", test_input: "", expected_output: "True" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  ADVANCED — Skill 5
  //  Recursion, OOP, decorators, generators, algorithms
  // ═══════════════════════════════════════════════════════════════════════
  Advanced: {

    logic_error: [
      { task: "Print all prime numbers between 1 and 20.", test_input: "", expected_output: "2\n3\n5\n7\n11\n13\n17\n19" },
      { task: "Print the GCD of 48 and 18.", test_input: "", expected_output: "6" },
      { task: "Write a function to check if a number is perfect. Print is_perfect(28).", test_input: "", expected_output: "True" },
      { task: "Write a binary search function. Print bsearch([1,2,3,4,5,6,7],5).", test_input: "", expected_output: "4" },
      { task: "Print the LCM of 12 and 18.", test_input: "", expected_output: "36" },
      { task: "Print the sum of all prime numbers between 1 and 20.", test_input: "", expected_output: "77" },
      { task: "Write a function to find the second largest in a list. Print second_largest([3,1,9,7,5]).", test_input: "", expected_output: "7" },
      //inheritance at Advanced level
      { task: "Write a class Animal with a speak method returning 'Generic sound'. Write a class Dog that inherits Animal and overrides speak to return 'Woof'. Print Dog().speak().", test_input: "", expected_output: "Woof" },
      { task: "Write a class Shape with an area method returning 0. Write a class Square inheriting Shape that overrides area to return side*side where side=4. Print Square().area().", test_input: "", expected_output: "16" },
      { task: "Write a parent class Vehicle with a method type() returning 'Vehicle'. Write a child class Car that overrides type() to return 'Car'. Print Car().type().", test_input: "", expected_output: "Car" }
    ],

    syntax_error: [
      { task: "Write a class Rectangle with width=4 and height=5. Print its area.", test_input: "", expected_output: "20" },
      { task: "Write a list comprehension to get squares of 1 to 5 and print it.", test_input: "", expected_output: "[1, 4, 9, 16, 25]" },
      { task: "Write a generator that yields numbers 1 to 5. Print each value.", test_input: "", expected_output: "1\n2\n3\n4\n5" },
      { task: "Write a lambda function that returns the square of a number. Print it applied to 7.", test_input: "", expected_output: "49" },
      { task: "Write a class Stack with push and pop methods. Push 1,2,3 then pop and print.", test_input: "", expected_output: "3" },
      { task: "Write a class Circle with radius=7. Print its area rounded to 2 decimals.", test_input: "", expected_output: "153.94" },
      { task: "Write a decorator that prints 'Start' before a function runs. Apply it to a function that prints 'Hello'.", test_input: "", expected_output: "Start\nHello" },
      //generators at Advanced level
      { task: "Write a generator function gen_nums() that yields 1,2,3,4,5. Print each value using a for loop.", expected_output: "1\n2\n3\n4\n5", test_input: "", function_call: null },
      { task: "Write a generator function squares() that yields squares of 1,2,3,4,5. Print each yielded value.", expected_output: "1\n4\n9\n16\n25", test_input: "", function_call: null },
      { task: "Write a generator function evens() that yields 2,4,6,8,10. Print each value.", expected_output: "2\n4\n6\n8\n10", test_input: "", function_call: null },
      //decorators at Advanced level
      { task: "Write a decorator that prints 'Start' before a function runs. Apply it to a function that prints 'Hello'.", test_input: "", expected_output: "Start\nHello" },
      { task: "Write a decorator that prints 'Before' and 'After' around a function that prints 'Running'.", test_input: "", expected_output: "Before\nRunning\nAfter" }
      
    ],

    infinite_loop: [
      { task: "Use binary search to find index of 7 in [1,3,5,7,9]. Print the index.", test_input: "", expected_output: "3" },
      { task: "Print the first 8 Fibonacci numbers.", test_input: "", expected_output: "0\n1\n1\n2\n3\n5\n8\n13" },
      { task: "Implement bubble sort and print the sorted version of [5,3,8,1,2].", test_input: "", expected_output: "[1, 2, 3, 5, 8]" },
      { task: "Implement selection sort and print the sorted version of [64,25,12,22,11].", test_input: "", expected_output: "[11, 12, 22, 25, 64]" },
      { task: "Print all armstrong numbers between 1 and 500.", test_input: "", expected_output: "1\n153\n370\n371\n407" },
      { task: "Use a while loop to find and print the 10th Fibonacci number.", test_input: "", expected_output: "34" },
      { task: "Print all perfect numbers between 1 and 500.", test_input: "", expected_output: "6\n28\n496" }
    ],

    missing_base_case: [
      { task: "Write a recursive binary search. Search for 5 in [1,2,3,4,5,6]. Print its index.", test_input: "", expected_output: "4" },
      { task: "Write a recursive power function. Print power(2, 10).", test_input: "", expected_output: "1024" },
      { task: "Write a recursive function to compute the nth Fibonacci. Print fib(10).", test_input: "", expected_output: "55" },
      { task: "Write a recursive function to check if a list is sorted. Print is_sorted([1,2,3,4]).", test_input: "", expected_output: "True" },
      { task: "Write a recursive merge sort and print sorted [38,27,43,3,9].", test_input: "", expected_output: "[3, 9, 27, 38, 43]" },
      { task: "Write a recursive function to flatten a nested list [[1,2],[3,4]]. Print the result.", test_input: "", expected_output: "[1, 2, 3, 4]" }
    ],

    no_function: [
      { task: "Write a function that returns the nth Fibonacci number recursively. Print fib(7).", test_input: "", expected_output: "13" },
      { task: "Write a function is_palindrome(s). Print is_palindrome('racecar').", test_input: "", expected_output: "True" },
      { task: "Write a recursive function to compute GCD. Print gcd(48,18).", test_input: "", expected_output: "6" },
      { task: "Write a function to rotate a list left by k positions. Print rotate([1,2,3,4,5],2).", test_input: "", expected_output: "[3, 4, 5, 1, 2]" },
      { task: "Write a function to check if two strings are anagrams. Print is_anagram('listen','silent').", test_input: "", expected_output: "True" },
      { task: "Write a function that returns all prime factors of a number. Print prime_factors(60).", test_input: "", expected_output: "[2, 2, 3, 5]" },
      { task: "Write a function to perform binary search. Print bsearch([1,3,5,7,9,11],7).", test_input: "", expected_output: "3" },
      //lambda at Advanced level
      { task: "Create a lambda function that returns the square of a number. Print it applied to 7.", test_input: "", expected_output: "49" },
      { task: "Create a lambda function that adds two numbers. Print it applied to 3 and 4.", test_input: "", expected_output: "7" },
      { task: "Use a lambda with sorted() to sort ['banana','apple','cherry'] alphabetically and print.", test_input: "", expected_output: "['apple', 'banana', 'cherry']" },
      { task: "Use a lambda with filter() to keep only even numbers from [1,2,3,4,5,6]. Print the result as a list.", test_input: "", expected_output: "[2, 4, 6]" },
      { task: "Use a lambda with map() to square each element of [1,2,3,4]. Print the result as a list.", test_input: "", expected_output: "[1, 4, 9, 16]" }
    ],

    missing_print: [
      { task: "Compute the sum of squares of numbers from 1 to 5 and print it.", test_input: "", expected_output: "55" },
      { task: "Count vowels in 'programming' and print the count.", test_input: "", expected_output: "3" },
      { task: "Write a recursive factorial function and print factorial(7).", test_input: "", expected_output: "5040" },
      { task: "Compute and print the dot product of [1,2,3] and [4,5,6].", test_input: "", expected_output: "32" },
      { task: "Compute and print the sum of all digits in 987654.", test_input: "", expected_output: "39" },
      { task: "Find and print all factors of 36.", test_input: "", expected_output: "1\n2\n3\n4\n6\n9\n12\n18\n36" },
      { task: "Compute and print the sum of digits of 12345.", test_input: "", expected_output: "15" }
    ],

    hardcoded_value: [
      { task: "Print the factorial of 6 by writing the computation, not the answer.", test_input: "", expected_output: "720" },
      { task: "Compute and print the sum of digits of 12345.", test_input: "", expected_output: "15" },
      { task: "Compute 2 to the power of 10 using recursion and print it.", test_input: "", expected_output: "1024" },
      { task: "Use a loop to compute and print the product of all numbers from 1 to 7.", test_input: "", expected_output: "5040" },
      { task: "Use recursion to compute and print the GCD of 56 and 98.", test_input: "", expected_output: "14" },
      { task: "Compute and print the number of digits in 123456789 using a loop.", test_input: "", expected_output: "9" },
      { task: "Compute the sum of the first 20 fibonacci numbers using a loop and print it.", test_input: "", expected_output: "10945" }
    ],

    idle_stuck: [
      { task: "Write a function to reverse a string. Print reverse('python').", test_input: "", expected_output: "nohtyp" },
      { task: "Print the largest element in [3, 1, 4, 1, 5, 9, 2, 6].", test_input: "", expected_output: "9" },
      { task: "Write a function to check if a number is prime. Print is_prime(29).", test_input: "", expected_output: "True" },
      { task: "Implement and print the result of bubble sorting [4,2,7,1,3].", test_input: "", expected_output: "[1, 2, 3, 4, 7]" },
      { task: "Write a generator yielding squares of 1 to 5 and print each.", test_input: "", expected_output: "1\n4\n9\n16\n25" },
      { task: "Write a class Animal with a speak method returning 'Roar'. Print Animal().speak().", test_input: "", expected_output: "Roar" },
      { task: "Find and print the most frequent element in [1,2,2,3,3,3,4].", test_input: "", expected_output: "3" }
    ]
  }
};
