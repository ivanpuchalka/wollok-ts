import { assert, should } from 'chai'
import link from '../src/linker'
import { Assignment as AssignmentNode, Body as BodyNode, Class as ClassNode, Constructor as ConstructorNode, Field as FieldMethod, Method as MethodNode, Package as PackageNode, Parameter as ParameterNode, Singleton as SingletonNode, Try as TryNode } from '../src/model'
import { validations } from '../src/validator'
import { Assignment, Catch, Class, Constructor, Field, Method, Package, Parameter, Reference, Singleton, Super, Try } from './builders'

should()

const WRE = Package('wollok')(
  Package('lang')(
    Class('Object')(),
    Class('Closure')()
  )
)

describe('Wollok Validations', () => {

  describe('Singleton', () => {

    it('Unnamed singleton', () => {
      const environment = link([
        WRE,
        Package('p')(
          Singleton()(),
          Singleton('s')(),
        ),
      ])

      const { singletonIsNotUnnamed } = validations(environment)
      const packageExample = environment.members[1] as PackageNode
      const singletonExample = packageExample.members[0] as SingletonNode
      const singletonExample2 = packageExample.members[1] as SingletonNode

      assert.ok(!!singletonIsNotUnnamed(singletonExample, 'singletonIsNotUnnamed'))
      assert.ok(!singletonIsNotUnnamed(singletonExample2, 'singletonIsNotUnnamed'))
    })
  })

  /*
  describe('Imports', () => {

    it('importHasNotLocalReference', () => {
      const enviroment = link([
        WRE,
        Package('p', {
          imports: [Import(Reference('c'))],
        })(Package('c')()),
      ])

      const packageExample = enviroment.members[1] as PackageNode
      const importExample = packageExample.imports[0]
      const { importHasNotLocalReference } = validations(enviroment)

      assert.ok(!!importHasNotLocalReference(importExample, 'importHasNotLocalReference'))
    })
  })*/

  describe('References', () => {
    it('nameIsNotKeyword', () => {
      const environment = link([
        WRE,
        Package('p')(
          Class('C',
            {
              superclass: Reference('program'),
            }
          )(),
          Class('C2',
            {
              superclass: Reference('C'),
            }
          )(),
          Class('program')(),
        ),
      ])

      const { nameIsNotKeyword } = validations(environment)
      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[0] as ClassNode
      const referenceExample = classExample.superclass!

      const classExample2 = packageExample.members[1] as ClassNode
      const referenceExample2 = classExample2.superclass!

      assert.ok(!!nameIsNotKeyword(referenceExample, 'nameIsNotKeyword')!)
      assert.ok(!nameIsNotKeyword(referenceExample2, 'nameIsNotKeyword')!)
    })
  })

  describe('Classes', () => {

    it('nameIsPascalCase', () => {
      const environment = link([
        WRE,
        Package('p')(
          Class('c')(),
          Class('C')(),
        ),
      ])

      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[0] as ClassNode
      const classExample2 = packageExample.members[1] as ClassNode
      const { nameIsPascalCase } = validations(environment)

      assert.ok(!!nameIsPascalCase(classExample, 'nameIsPascalCase')!)
      assert.ok(!nameIsPascalCase(classExample2, 'nameIsPascalCase')!)

    })

    it('methodsHaveDistinctSignatures', () => {
      const environment = link([
        WRE,
        Package('p')(
          Class('classExample')(
            Method('m', {
              parameters: [Parameter('a'), Parameter('b')],
            })(),
            Method('m', {
              parameters: [Parameter('c'), Parameter('d')],
            })(),
          ),

          Class('classExample2')(
            Method('m', {
              parameters: [Parameter('a')],
            })(),
            Method('m', {
              parameters: [Parameter('c'), Parameter('d')],
            })(),
          ),

          Class('classExample3')(
            Method('m', {
              parameters: [Parameter('a'), Parameter('b')],
            })(),
            Method('m', {
              parameters: [Parameter('q', { isVarArg: true })],
            })(),
          ),

          Class('classExample4')(
            Method('m', {
              parameters: [Parameter('a'), Parameter('b')],
            })(),
            Method('m', {
              parameters: [Parameter('a'), Parameter('b'), Parameter('q', { isVarArg: true })],
            })(),
          ),

        ),
      ])

      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[0] as ClassNode
      const classExample2 = packageExample.members[1] as ClassNode
      const classExample3 = packageExample.members[2] as ClassNode
      const classExample4 = packageExample.members[3] as ClassNode

      const { methodsHaveDistinctSignatures } = validations(environment)

      assert.ok(!!methodsHaveDistinctSignatures(classExample, 'methodsHaveDistinctSignatures'))
      assert.ok(!!methodsHaveDistinctSignatures(classExample3, 'methodsHaveDistinctSignatures'))
      assert.ok(!methodsHaveDistinctSignatures(classExample4, 'methodsHaveDistinctSignatures'))
      assert.ok(!methodsHaveDistinctSignatures(classExample2, 'methodsHaveDistinctSignatures'))

    })


  })

  describe('Constructors', () => {

    it('constructorsHaveDistinctArity', () => {
      const environment = link([
        WRE,
        Package('p')(
          Class('c')(
            Constructor({
              parameters: [Parameter('p'), Parameter('q')],
            })(),
            Constructor({
              parameters: [Parameter('k'), Parameter('l')],
            })()
          ),
          Class('c2')(
            Constructor({
              parameters: [Parameter('p'), Parameter('q')],
            })(),
            Constructor({
              parameters: [Parameter('q', {
                isVarArg: true,
              })],
            })()
          ),
          Class('c3')(
            Constructor({
              parameters: [Parameter('a'), Parameter('b')],
            })(),
            Constructor({
              parameters: [Parameter('a'), Parameter('b'), Parameter('q', { isVarArg: true })],
            })()
          ),
        ),
      ])

      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[0] as ClassNode
      const constructorExample = classExample.members[0] as ConstructorNode
      const classExample2 = packageExample.members[1] as ClassNode
      const constructorExample2 = classExample2.members[0] as ConstructorNode
      const classExample3 = packageExample.members[2] as ClassNode
      const constructorExample3 = classExample3.members[0] as ConstructorNode

      const { constructorsHaveDistinctArity } = validations(environment)

      assert.ok(!!constructorsHaveDistinctArity(constructorExample, 'constructorsHaveDistinctArity'))
      assert.ok(!!constructorsHaveDistinctArity(constructorExample2, 'constructorsHaveDistinctArity'))
      assert.ok(!constructorsHaveDistinctArity(constructorExample3, 'constructorsHaveDistinctArity'))
    })


  })

  describe('Methods', () => {

    it('onlyLastParameterIsVarArg', () => {
      const environment = link([
        WRE,
        Package('p')(
          Class('C')(
            Method('m', {
              parameters: [Parameter('c'), Parameter('q', { isVarArg: true }), Parameter('p')],
            })(),
            Method('m2', {
              parameters: [Parameter('c'), Parameter('q', { isVarArg: true })],
            })()),
        ),
      ])

      const { onlyLastParameterIsVarArg } = validations(environment)

      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[0] as ClassNode
      const methodExample = classExample.members[0] as MethodNode
      const methodExample2 = classExample.members[1] as MethodNode

      assert.ok(!!onlyLastParameterIsVarArg(methodExample, 'onlyLastParameterIsVarArg'))
      assert.ok(!onlyLastParameterIsVarArg(methodExample2, 'onlyLastParameterIsVarArg'))

    })

    it('notOnlyCallToSuper', () => {
      const environment = link([
        WRE,
        Package('p')(
          Class('C')(
            Method('m')(),
          ),
          Class('C2',
            { superclass: Reference('C') }
          )(Method('m')(Super())),

        ),
      ])

      const { methodNotOnlyCallToSuper } = validations(environment)

      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[1] as ClassNode
      const methodExample = classExample.members[0] as MethodNode

      assert.ok(!!methodNotOnlyCallToSuper(methodExample, 'onlyLastParameterIsVarArg'))

    })
  })

  describe('Assignments', () => {

    it('nonAsignationOfFullyQualifiedReferences', () => {
      const environment = link([
        WRE,
        Package('p')(
          Class('C')(
            Field('a'),
            Field('b'),
            Method('m')(Assignment(Reference('p.C'), Reference('a')), Assignment(Reference('a'), Reference('b'))),
          )
        ),
      ])


      const { nonAsignationOfFullyQualifiedReferences } = validations(environment)

      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[0] as ClassNode
      const methodExample = classExample.members[2] as MethodNode
      const bodyExample = methodExample.body as BodyNode
      const assingnmentExample = bodyExample.sentences[0] as AssignmentNode
      const assingnmentExample2 = bodyExample.sentences[1] as AssignmentNode

      assert.ok(!!nonAsignationOfFullyQualifiedReferences(assingnmentExample, 'nonAsignationOfFullyQualifiedReferences'))
      assert.ok(!nonAsignationOfFullyQualifiedReferences(assingnmentExample2, 'nonAsignationOfFullyQualifiedReferences'))

    })

  })

  describe('Try', () => {

    it('Try has catch or always', () => {

      const environment = link([
        WRE,
        Package('p')(
          Class('C')(
            Method('m')(Try([Reference('x')], {})),
            Method('m2')(
              Try([Reference('x')], {
                catches: [
                  Catch(Parameter('e'))(Reference('h')),
                ],
              })
            ),
            Method('m3')(
              Try([Reference('x')], {
                always: [Reference('a')],
              })
            )
          ),
        ),
      ])

      const { hasCatchOrAlways } = validations(environment)

      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[0] as ClassNode
      const methodExample = classExample.members[0] as MethodNode
      const bodyExample = methodExample.body as BodyNode
      const tryExample = bodyExample.sentences[0] as TryNode

      const methodExample2 = classExample.members[1] as MethodNode
      const bodyExample2 = methodExample2.body as BodyNode
      const tryExample2 = bodyExample2.sentences[0] as TryNode

      const methodExample3 = classExample.members[2] as MethodNode
      const bodyExample3 = methodExample3.body as BodyNode
      const tryExample3 = bodyExample3.sentences[0] as TryNode

      assert.ok(!!hasCatchOrAlways(tryExample, 'hasCatchOrAlways'))
      assert.ok(!hasCatchOrAlways(tryExample2, 'hasCatchOrAlways'))
      assert.ok(!hasCatchOrAlways(tryExample3, 'hasCatchOrAlways'))

    })

  })

  describe('Parameters', () => {
    it('nameIsCamelCase', () => {
      const environment = link([
        WRE,
        Package('p')(
          Class('C')(
            Method('m', {
              parameters: [Parameter('C'), Parameter('k')],
            })()
          ),
        ),
      ])

      const { nameIsCamelCase } = validations(environment)

      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[0] as ClassNode
      const methodExample = classExample.members[0] as MethodNode
      const parameterExample = methodExample.parameters[0] as ParameterNode
      const parameterExample2 = methodExample.parameters[1] as ParameterNode

      assert.ok(!!nameIsCamelCase(parameterExample, 'nameIsCamelCase'))
      assert.ok(!nameIsCamelCase(parameterExample2, 'nameIsCamelCase'))
    })
  })

  describe('Fields', () => {
    it('fieldNameDifferentFromTheMethods', () => {
      const environment = link([
        WRE,
        Package('p')(
          Class('c')(
            Field('m'),
            Field('a'),
            Method('m')(),
          ),

        ),
      ])

      const { fieldNameDifferentFromTheMethods } = validations(environment)

      const packageExample = environment.members[1] as PackageNode
      const classExample = packageExample.members[0] as ClassNode
      const fieldExample = classExample.members[0] as FieldMethod
      const fieldExample2 = classExample.members[1] as FieldMethod

      assert.ok(!!fieldNameDifferentFromTheMethods(fieldExample, 'fieldNameDifferentFromTheMethods'))
      assert.ok(!fieldNameDifferentFromTheMethods(fieldExample2, 'fieldNameDifferentFromTheMethods'))

    })
  })


})