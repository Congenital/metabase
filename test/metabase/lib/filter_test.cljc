(ns metabase.lib.filter-test
  (:require
   [clojure.test :refer [deftest is]]
   [clojure.test.check.generators :as gen]
   [clojure.walk :as walk]
   [com.gfredericks.test.chuck.clojure-test :as chuck.test :refer [checking]]
   [malli.core :as mc]
   [malli.generator :as mg]
   [metabase.lib.core :as lib]
   [metabase.lib.metadata :as lib.metadata]
   [metabase.lib.schema.filter :as schema.filter]
   [metabase.lib.schema.filter-test :as schema.filter-test]
   [metabase.lib.test-metadata :as meta]
   [metabase.mbql.util :as mbql.u]
   #?@(:cljs ([metabase.test-runner.assert-exprs.approximately-equal])))
  #?(:cljs (:require-macros [metabase.mbql.util])))

(defn- field-metadata-gen
  [[_ id-or-name]]
  (if (integer? id-or-name)
    (gen/let [[table fields] (gen/elements (for [table (:tables meta/metadata)]
                                             [(:name table) (map :name (:fields table))]))
              field (gen/elements fields)]
      (-> (lib/query-for-table-name meta/metadata-provider table)
          (lib.metadata/field nil table field)))
    (gen/let [field (gen/elements (map :name (:columns meta/results-metadata)))]
      (-> (lib/saved-question-query meta/metadata-provider meta/saved-question)
          (lib.metadata/stage-column -1 field)))))

(def ^:private filter-expr-gen
  (gen/let [filter-shape (gen/such-that #(-> % first (= :field) not)
                                        (mg/generator ::schema.filter/filter))
            fields (gen/return (set (mbql.u/match filter-shape #{:field :field/unresolved})))
            field->metadata (gen/return (zipmap fields
                                                (map #(-> % field-metadata-gen gen/generate)
                                                     fields)))]
    (walk/postwalk (fn [form]
                     (if-let [metadata (field->metadata form)]
                       metadata
                       form))
                   filter-shape)))

(comment
  (gen/generate (field-metadata-gen ["field" 3]))
  (gen/sample filter-expr-gen)
  nil)

(deftest ^:parallel filter-creation
  (checking "filters can be created"
    [filter-expr filter-expr-gen]
    (let [[op _options & args] filter-expr
          f (schema.filter-test/filter-creation-function op)]
      (is (some? f))
      (when f
        (is (fn? f))
        (is (mc/validate ::schema.filter/filter
                         (apply f {:lib/metadata meta/metadata} -1 args)))))))
