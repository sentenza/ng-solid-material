import { Injectable, OnInit } from '@angular/core'
import * as Rdf from 'rdflib'
import { SolidSession } from '../models/solid-session.model'
import { NgForm } from '@angular/forms'
declare let solid: any

const VCARD = Rdf.Namespace('http://www.w3.org/2006/vcard/ns#')
const FOAF = Rdf.Namespace('http://xmlns.com/foaf/0.1/')

/**
 * A service layer for retrieving data from rdf sources
 */
@Injectable({
  providedIn: 'root'
})
export class RdfService implements OnInit {

  /**
   * Session: we need the webId
   */
  session: SolidSession

  /**
   * Graph Store
   */
  store = Rdf.graph()

  /**
   * A helper object that connects to the web, loads data, and saves it back. More powerful than using a simple
   * store object.
   * When you have a fetcher, then you also can ask the query engine to go fetch new linked data automatically
   * as your query makes its way across the web.
   */
  fetcher: Rdf.Fetcher

  /**
   * The UpdateManager allows you to send small changes to the server to “patch” the data as your user changes data in
   * real time. It also allows you to subscribe to changes other people make to the same file, keeping track of
   * upstream and downstream changes, and signaling any conflict between them.
   */
  updateManager: Rdf.UpdateManager

  constructor() {
    const fetcherOptions = {}
    this.fetcher = new Rdf.Fetcher(this.store, fetcherOptions)
    this.updateManager = new Rdf.UpdateManager(this.store)
  }

  ngOnInit() {
    this.getSession()
  }

  /**
   * Fetches the session from Solid, and store results in localStorage
   */
  getSession = async() => {
    this.session = await solid.auth.currentSession(localStorage)
  }

  /**
   * Gets a node that matches the specified pattern using the VCARD onthology
   * @param {string} node
   * @param {string?} webId
   * @return {string}
   */
  getValueFromVcard = (node: string, webId?: string): string => {
    const fetchedNode = this.store.any(Rdf.sym(webId || this.session.webId), VCARD(node))
    if (fetchedNode) {
      return fetchedNode.value
    }
    return ''
  }

  /**
   * Gets a node that matches the specified pattern using the FOAF onthology
   * @param {string} node
   * @param {string?} webId
   * @return {string}
   */
  getValueFromFoaf = (node: string, webId?: string): string => {
    const store = this.store.any(Rdf.sym(webId || this.session.webId), FOAF(node))
    if (store) {
      return store.value
    }
    return ''
  }

  transformDataForm = (form: NgForm, me: any, doc: any) => {
    const insertions = []
    const deletions = []
    const fields = Object.keys(form.value)
    const oldProfileData = JSON.parse(localStorage.getItem('oldProfileData')) || {}

    // We need to split out into three code paths here:
    // 1. There is an old value and a new value. This is the update path
    // 2. There is no old value and a new value. This is the insert path
    // 3. There is an old value and no new value. Ths is the delete path
    // These are separate codepaths because the system needs to know what to do in each case
    fields.map(field => {
      const predicate = VCARD(this.getFieldName(field))
      const subject = this.getUriForField(field, me)
      const why = doc

      const fieldValue = this.getFieldValue(form, field)
      const oldFieldValue = this.getOldFieldValue(field, oldProfileData)

      // if there's no existing home phone number or email address, we need to add one, then add the link for hasTelephone
      // or hasEmail
      if (!oldFieldValue && fieldValue && (field === 'phone' || field === 'email')) {
        this.addNewLinkedField(field, insertions, predicate, fieldValue, why, me)
      } else {
        // Add a value to be updated
        if (oldProfileData[field] && form.value[field] && !form.controls[field].pristine) {
          deletions.push(Rdf.st(subject, predicate, oldFieldValue, why))
          insertions.push(Rdf.st(subject, predicate, fieldValue, why))
        } else if (oldProfileData[field] && !form.value[field] && !form.controls[field].pristine) {
          // Add a value to be deleted
          deletions.push(Rdf.st(subject, predicate, oldFieldValue, why))
        } else if (!oldProfileData[field] && form.value[field] && !form.controls[field].pristine) {
          // Add a value to be inserted
          insertions.push(Rdf.st(subject, predicate, fieldValue, why))
        }
      }
    })

    return {
      insertions: insertions,
      deletions: deletions
    }
  }

  updateProfile = async (form: NgForm) => {
    const me: Rdf.NamedNode = Rdf.sym(this.session.webId)
    const doc = Rdf.NamedNode.fromValue(this.session.webId.split('#')[0])
    const data = this.transformDataForm(form, me, doc)

    // Update existing values
    if (data.insertions.length > 0 || data.deletions.length > 0) {
      this.updateManager.update(data.deletions, data.insertions, (response, success, message) => {
        if (success) {
          // TODO: use a callback or an observable to return this message
          console.log('Your Solid profile has been successfully updated', 'Success!')
          form.form.markAsPristine()
          form.form.markAsTouched()
        } else {
          throw new Error('Message: ' + message)
        }
      })
    }
  }

  getAddress = () => {
    const linkedUri = this.getValueFromVcard('hasAddress')

    if (linkedUri) {
      return {
        locality: this.getValueFromVcard('locality', linkedUri),
        country_name: this.getValueFromVcard('country-name', linkedUri),
        region: this.getValueFromVcard('region', linkedUri),
        street: this.getValueFromVcard('street-address', linkedUri),
      }
    }

    return {}
  }

  /**
   * Function to get email. This returns only the first email, which is temporary
   */
  getEmail = () => {
    const linkedUri = this.getValueFromVcard('hasEmail')

    if (linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('mailto:')[1]
    }

    return ''
  }

  /**
   * Function to get phone number.
   * This returns only the first phone number, which is temporary. It also ignores the type.
   */
  getPhone = () => {
    const linkedUri = this.getValueFromVcard('hasTelephone')

    if (linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('tel:+')[1]
    }
  }

  getProfile = async () => {

    if (!this.session) {
      await this.getSession()
    }

    try {
      await this.fetcher.load(this.session.webId)

      return {
        fn : this.getValueFromVcard('fn'),
        company : this.getValueFromVcard('organization-name'),
        phone: this.getPhone(),
        role: this.getValueFromVcard('role'),
        image: this.getValueFromVcard('hasPhoto'),
        address: this.getAddress(),
        email: this.getEmail(),
      }
    } catch (error) {
      console.log(`Error fetching data: ${error}`)
    }
  }

  /**
   * Given a  field it returns its name as a string
   * @param {string} field The field
   * @return {string} The correspondent name of the field
   */
  private getFieldName(field: string): string {
    switch (field) {
      case 'company':
        return 'organization-name'
      case 'phone':
      case 'email':
        return 'value'
      default:
        return field
    }
  }

  /**
   * Given a Field, this function will return its URI
   * @param {string} field The field
   * @param {any} me
   */
  private getUriForField(field: string, me): any {
    let uriString: string
    let uri: any // Should it be a NamedNode?

    switch (field) {
      case 'phone':
        uriString = this.getValueFromVcard('hasTelephone')
        if (uriString) {
          uri = Rdf.sym(uriString)
        }
        break
      case 'email':
        uriString = this.getValueFromVcard('hasEmail')
        if (uriString) {
          uri = Rdf.sym(uriString)
        }
        break
      default:
        uri = me
        break
    }

    return uri
  }

  /**
   * Extracts the value of a field of a NgForm and converts it to a Rdf.NamedNode
   * @param {NgForm} form
   * @param {string} field The name of the field that is going to be extracted from the form
   * @return {RdfNamedNode}
   */
  private getFieldValue(form: NgForm, field: string): any {
    let fieldValue: any

    if (!form.value[field]) {
      return
    }

    switch (field) {
      case 'phone':
        fieldValue = Rdf.sym('tel:+' + form.value[field])
        break
      case 'email':
        fieldValue = Rdf.sym('mailto:' + form.value[field])
        break
      default:
        fieldValue = form.value[field]
        break
    }

    return fieldValue
  }

  private getOldFieldValue(field, oldProfile): any {
    let oldValue: any

    if (!oldProfile || !oldProfile[field]) {
      return
    }

    switch (field) {
      case 'phone':
        oldValue = Rdf.sym('tel:+' + oldProfile[field])
        break
      case 'email':
        oldValue = Rdf.sym('mailto:' + oldProfile[field])
        break
      default:
        oldValue = oldProfile[field]
        break
    }

    return oldValue
  }

  private addNewLinkedField(field: string, insertions, predicate, fieldValue, why, me: any) {
    // Generate a new ID. This id can be anything but needs to be unique.
    const newId = field + ':' + Date.now()

    // Get a new subject, using the new ID
    const newSubject: Rdf.NamedNode = Rdf.sym(this.session.webId.split('#')[0] + '#' + newId)

    // Set new predicate, based on email or phone fields
    const newPredicate = field === 'phone' ? Rdf.sym(VCARD('hasTelephone').toString()) : Rdf.sym(VCARD('hasEmail').toString())

    // Add new phone or email to the pod
    insertions.push(Rdf.st(newSubject, predicate, fieldValue, why))

    // Set the type (defaults to Home/Personal for now) and insert it into the pod as well
    // Todo: Make this dynamic
    const type = field === 'phone' ? Rdf.literal('Home', 'en') : Rdf.literal('Personal', 'en')
    insertions.push(Rdf.st(newSubject, VCARD('type'), type, why))

    // Add a link in #me to the email/phone number (by id)
    insertions.push(Rdf.st(me, newPredicate, newSubject, why))
  }
}
