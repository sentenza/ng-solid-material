import { Injectable } from '@angular/core'
import { NgForm } from '@angular/forms'
import { Subject, from } from 'rxjs'
import { SolidSession } from '../models/solid-session.model'
import { SolidProfile } from '../models/solid-profile.model'
import * as $rdf from 'rdflib'
declare let solid: any

const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#')
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
// TODO: Remove any UI interaction

/**
 * A service layer for RDF data manipulation using rdflib.js
 * @see https://solid.inrupt.com/docs/manipulating-ld-with-rdflib
 */
@Injectable({
  providedIn: 'root'
})
export class RdfService {

  /**
   * Session: we need the webId
   */
  session: SolidSession

  /**
   * Graph Store
   */
  store = $rdf.graph()

  /**
   * A helper object that connects to the web, loads data, and saves it back. More powerful than using a simple
   * store object.
   * When you have a fetcher, then you also can ask the query engine to go fetch new linked data automatically
   * as your query makes its way across the web.
   * @see http://linkeddata.github.io/rdflib.js/doc/Fetcher.html
   */
  fetcher: $rdf.Fetcher

  /**
   * The UpdateManager allows you to send small changes to the server to “patch” the data as your user changes data in
   * real time. It also allows you to subscribe to changes other people make to the same file, keeping track of
   * upstream and downstream changes, and signaling any conflict between them.
   * @see http://linkeddata.github.io/rdflib.js/doc/UpdateManager.html
   */
  updateManager: $rdf.UpdateManager

  /**
   * A Subject containing the SolidProfile of the
   * user associated to the session.webId
   * @type {Subject<Profile>}
   */
  solidProfile$: Subject<SolidProfile>

  constructor() {
    const fetcherOptions = {}
    this.fetcher = new $rdf.Fetcher(this.store, fetcherOptions)
    this.updateManager = new $rdf.UpdateManager(this.store)
    this.solidProfile$ = new Subject<SolidProfile>()
  }

  /**
   * Fetch a SolidProfile taking advantage of rdflib.
   *
   * Note about $rdf.Fetcher.load(): Promise-based load function,
   * Loads a web resource or resources into the store. A resource may be given as NamedNode object,
   * or as a plain URI. an arrsy of resources will be given, in which they will be fetched in parallel.
   * By default, the HTTP headers are recorded also, in the same store, in a separate graph.
   *
   * @throws {Error} if the $rdf.Fetcher fails to load the profile
   * @return {void}
   */
  fetchProfile(webId: string) {
    // TODO validate the empty string
    if (webId === '') {
      throw new Error('getProfile: Invalid webId')
    }
    // Wait for the Fetcher/Promise and produce the next value for the Subject
    from(this.fetcher.load(webId))
      .subscribe(
        _ => {
          // Fetcher.load will save its results into the store ($rdf.graph())
          // Creating a new SolidProfile from the data saved into the store
          const profile: SolidProfile = {
            fn : this.getValueFromVcard('fn', webId),
            company : this.getValueFromVcard('organization-name', webId),
            phone: this.getPhone(webId),
            role: this.getValueFromVcard('role', webId),
            image: this.getValueFromVcard('hasPhoto', webId),
            address: this.getAddress(webId),
            email: this.getEmail(webId),
          }
          this.solidProfile$.next(profile)
        },
        error => {throw new Error(`Error fetching Solid Profile data: ${error}`)}
      )
  }

  /**
   * Gets a node that matches the specified pattern using the VCARD onthology
   *
   * any() can take a subject and a predicate to find Any one person identified by the webId
   * that matches against the node/predicated
   *
   * @param {string} node VCARD predicate to apply to the $$rdf.any()
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   * @return {string\any} The value of the fetched node or an emtpty string
   * @see https://github.com/solid/solid-tutorial-rdflib.js
   */
  getValueFromVcard = (node: string, webId: string): string | any => {
    return this.getValueFromNamespace(node, VCARD, webId)
  }

  /**
   * Gets a node that matches the specified pattern using the FOAF onthology
   * @param {string} node FOAF predicate to apply to the $$rdf.any()
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   * @return {string|any} The value of the fetched node or an emtpty string
   */
  getValueFromFoaf = (node: string, webId: string): string | any => {
    return this.getValueFromNamespace(node, FOAF, webId)
  }

  transformDataForm = (form: NgForm, me: any, doc: any, webId: string) => {
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
      const subject = this.getUriForField(field, me, webId)
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
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why))
          insertions.push($rdf.st(subject, predicate, fieldValue, why))
        } else if (oldProfileData[field] && !form.value[field] && !form.controls[field].pristine) {
          // Add a value to be deleted
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why))
        } else if (!oldProfileData[field] && form.value[field] && !form.controls[field].pristine) {
          // Add a value to be inserted
          insertions.push($rdf.st(subject, predicate, fieldValue, why))
        }
      }
    })

    return {
      insertions: insertions,
      deletions: deletions
    }
  }

  updateProfile = async (webId: string, form: NgForm) => {
    const me: $rdf.NamedNode = $rdf.sym(webId)
    const doc = $rdf.NamedNode.fromValue(webId.split('#')[0])
    const data = this.transformDataForm(form, me, doc, webId)

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

  getAddress = (webId: string) => {
    const linkedUri = this.getValueFromVcard('street-address', webId)

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
  getEmail = (webId) => {
    const linkedUri = this.getValueFromVcard('hasEmail', webId)

    if (linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('mailto:')[1]
    }

    return ''
  }

  /**
   * Function to get phone number.
   * This returns only the first phone number, which is temporary. It also ignores the type.
   */
  getPhone = (webId: string) => {
    const linkedUri = this.getValueFromVcard('hasTelephone', webId)

    if (linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('tel:+')[1]
    }
  }

  /**
   * Gets any resource that matches the node, using the provided Namespace
   * @param {string} node The name of the predicate to be applied using the provided Namespace
   * @param {$rdf.namespace} namespace The RDF Namespace
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   */
  private getValueFromNamespace(node: string, namespace: $rdf.Namespace, webId?: string): string | any {
    const userNamedNode = $rdf.sym(webId)
    const store = this.store.any(userNamedNode, namespace(node))
    if (store) {
      return store.value
    }
    return ''
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
   * @param {string} webId WebID URL
   */
  private getUriForField(field: string, me, webId: string): any {
    let uriString: string
    let uri: any // Should it be a NamedNode?

    switch (field) {
      case 'phone':
        uriString = this.getValueFromVcard('hasTelephone', webId)
        if (uriString) {
          uri = $rdf.sym(uriString)
        }
        break
      case 'email':
        uriString = this.getValueFromVcard('hasEmail', webId)
        if (uriString) {
          uri = $rdf.sym(uriString)
        }
        break
      default:
        uri = me
        break
    }

    return uri
  }

  /**
   * Extracts the value of a field of a NgForm and converts it to a $rdf.NamedNode
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
        fieldValue = $rdf.sym('tel:+' + form.value[field])
        break
      case 'email':
        fieldValue = $rdf.sym('mailto:' + form.value[field])
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
        oldValue = $rdf.sym('tel:+' + oldProfile[field])
        break
      case 'email':
        oldValue = $rdf.sym('mailto:' + oldProfile[field])
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
    const newSubject: $rdf.NamedNode = $rdf.sym(this.session.webId.split('#')[0] + '#' + newId)

    // Set new predicate, based on email or phone fields
    const newPredicate = field === 'phone' ? $rdf.sym(VCARD('hasTelephone').toString()) : $rdf.sym(VCARD('hasEmail').toString())

    // Add new phone or email to the pod
    insertions.push($rdf.st(newSubject, predicate, fieldValue, why))

    // Set the type (defaults to Home/Personal for now) and insert it into the pod as well
    // Todo: Make this dynamic
    const type = field === 'phone' ? $rdf.literal('Home', 'en') : $rdf.literal('Personal', 'en')
    insertions.push($rdf.st(newSubject, VCARD('type'), type, why))

    // Add a link in #me to the email/phone number (by id)
    insertions.push($rdf.st(me, newPredicate, newSubject, why))
  }
}
