import PropTypes from "prop-types";
import React from "react";

import {
  Layout,
  SingleSelectFacet,
  SingleLinksFacet,
  BooleanFacet,
  appendClassName,
  getUrlSanitizer,
  isFieldValueWrapper
} from "@elastic/react-search-ui-views";

import "@elastic/react-search-ui-views/lib/styles/styles.css";

function getFieldType(result, field, type) {
  if (result[field]) return result[field][type];
}

function getRaw(result, field) {
  return getFieldType(result, field, "raw");
}

function getSnippet(result, field) {
  return getFieldType(result, field, "snippet");
}

function htmlEscape(str) {
  if (!str) return "";

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getEscapedField(result, field) {
  // Fallback to raw values here, because non-string fields
  // will not have a snippet fallback. Raw values MUST be html escaped.
  const safeField =
    getSnippet(result, field) || htmlEscape(getRaw(result, field));
  return Array.isArray(safeField) ? safeField.join(", ") : safeField;
}

function Result({
  className,
  result,
  onClickLink,
  titleField,
  urlField,
  ...rest
}) {

  // const title = getEscapedField(result, titleField);
  // const url = getUrlSanitizer(URL, location)(getRaw(result, urlField));

  // const title = titleField.raw
  // const url = urlField.raw

  // console.log(result)
  // console.log(titleField)
  // console.log(urlField)
  console.log(result)

  // const description = result.description

  return (
    <li clsx={"sui-result"}>
      <div className="sui-result__header">
        {(() => {
          if (result.url.raw.includes('learn.netdata.cloud') == true) {
            return (
              <Link
                className="sui-result__title sui-result__title-link"
                dangerouslySetInnerHTML={{ __html: result.title.raw }}
                to={result.url.raw}
                onClick={onClickLink}
                target="_self"
              />
            )
          } else {
            return (
              <a
                className="sui-result__title sui-result__title-link"
                dangerouslySetInnerHTML={{ __html: result.title.raw }}
                href={result.url.raw}
                onClick={onClickLink}
                target="_self"
                rel="noopener noreferrer"
              />
            )
          }
        })}
      </div>
      <div className="sui-result__body">
        {result.description && 
          <p>{result.description.raw}</p>
        }
      </div>
    </li>
  )
}

Result.propTypes = {
  result: PropTypes.object.isRequired,
  onClickLink: PropTypes.func.isRequired,
  className: PropTypes.string,
  titleField: PropTypes.string,
  urlField: PropTypes.string
};

export default Result;